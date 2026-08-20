import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

const usersRef = collection(db, "users");
const productsRef = collection(db, "products");
const inquiriesRef = collection(db, "inquiries");

const RECENT_LIMIT = 5;

/*
 * ============================================================
 * USER MANAGEMENT
 * ============================================================
 */

/**
 * Suspend or activate a user.
 *
 * This only changes the Firestore account status.
 *
 * status:
 * - "active"
 * - "suspended"
 *
 * Firebase Authentication is NOT disabled.
 */
export async function setUserSuspension(uid, status) {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    status,
  });
}

/**
 * Change a user's role.
 *
 * Supported roles:
 * - consumer
 * - farmer
 * - admin
 *
 * Access is enforced by Firestore Security Rules.
 */
export async function setUserRole(uid, role) {
  if (!uid) {
    throw new Error("User UID is required.");
  }

  const allowedRoles = ["consumer", "farmer", "admin"];

  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid user role.");
  }

  await updateDoc(doc(db, "users", uid), {
    role,
    updatedAt: serverTimestamp(),
  });

  return {
    uid,
    role,
  };
}

/*
 * ============================================================
 * DASHBOARD HELPERS
 * ============================================================
 */

/**
 * Get the count of documents matching
 * a Firestore query.
 */
async function getCount(q) {
  const snapshot = await getCountFromServer(q);

  return snapshot.data().count;
}

/**
 * Get the most recently created documents.
 */
async function getRecentDocuments(ref) {
  const q = query(ref, orderBy("createdAt", "desc"), limit(RECENT_LIMIT));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

/*
 * ============================================================
 * DASHBOARD STATISTICS
 * ============================================================
 */

export async function getDashboardStats() {
  const [
    totalUsers,
    totalFarmers,
    totalConsumers,
    totalAdmins,
    suspendedUsers,

    totalProducts,
    availableProducts,

    totalInquiries,
    acceptedInquiries,
    ongoingInquiries,
    completedInquiries,
    cancelledInquiries,
  ] = await Promise.all([
    /*
     * --------------------------------------------------------
     * Users
     * --------------------------------------------------------
     */

    getCount(usersRef),

    getCount(query(usersRef, where("role", "==", "farmer"))),

    getCount(query(usersRef, where("role", "==", "consumer"))),

    getCount(query(usersRef, where("role", "==", "admin"))),

    getCount(query(usersRef, where("status", "==", "suspended"))),

    /*
     * --------------------------------------------------------
     * Products
     * --------------------------------------------------------
     */

    getCount(productsRef),

    getCount(query(productsRef, where("available", "==", true))),

    /*
     * --------------------------------------------------------
     * Inquiries
     * --------------------------------------------------------
     */

    getCount(inquiriesRef),

    getCount(query(inquiriesRef, where("status", "==", "accepted"))),

    getCount(query(inquiriesRef, where("status", "==", "ongoing"))),

    getCount(query(inquiriesRef, where("status", "==", "completed"))),

    getCount(query(inquiriesRef, where("status", "==", "cancelled"))),
  ]);

  return {
    users: {
      total: totalUsers,
      farmers: totalFarmers,
      consumers: totalConsumers,
      admins: totalAdmins,
      suspended: suspendedUsers,
      active: totalUsers - suspendedUsers,
    },

    products: {
      total: totalProducts,
      available: availableProducts,
      unavailable: totalProducts - availableProducts,
    },

    inquiries: {
      total: totalInquiries,
      accepted: acceptedInquiries,
      ongoing: ongoingInquiries,
      completed: completedInquiries,
      cancelled: cancelledInquiries,
    },
  };
}

/*
 * ============================================================
 * RECENT DATA
 * ============================================================
 */

/**
 * Get recently registered users.
 */
export async function getRecentUsers() {
  return getRecentDocuments(usersRef);
}

/**
 * Get recently created products.
 */
export async function getRecentProducts() {
  return getRecentDocuments(productsRef);
}

/**
 * Get recently created inquiries.
 */
export async function getRecentInquiries() {
  return getRecentDocuments(inquiriesRef);
}
