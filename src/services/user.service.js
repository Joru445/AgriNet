import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  orderBy,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

const usersRef = collection(db, "users");

const USER_PAGE_SIZE = 100;

/*
 * ============================================================
 * CREATE USER
 * ============================================================
 */

export async function createUser(data) {
  await setDoc(doc(db, "users", data.uid), {
    uid: data.uid,

    fullname: data.fullname,
    fullnameLower: data.fullnameLower,
    username: data.username,
    email: data.email,
    role: data.role,

    profilePicture: "",
    profilePictureId: "",

    phone: data.phone,
    bio: "",

    location: data.location,

    status: "active",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/*
 * ============================================================
 * GET USERS
 * ============================================================
 */

export async function getUsers() {
  const snapshot = await getDocs(usersRef);

  return snapshot.docs.map((userDoc) => ({
    uid: userDoc.id,
    ...userDoc.data(),
  }));
}

/*
 * ============================================================
 * GET USER PROFILE
 * ============================================================
 */

export async function getUserProfile(uid) {
  if (!uid || typeof uid !== "string") {
    throw new Error("Invalid user UID.");
  }

  const userRef = doc(db, "users", uid);

  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    uid: snapshot.id,
    ...snapshot.data(),
  };
}

/*
 * ============================================================
 * UPDATE USER PROFILE
 * ============================================================
 *
 * Used by the normal profile system.
 *
 * Automatically updates updatedAt.
 */

export async function updateUser(uid, data) {
  await updateDoc(
    doc(db, "users", uid),
    removeUndefined({
      ...data,
      updatedAt: serverTimestamp(),
    }),
  );
}

/*
 * ============================================================
 * UPDATE USER ROLE
 * ============================================================
 *
 * Used by Admin User Management.
 */

export async function updateUserRole(uid, role) {
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
}

/*
 * ============================================================
 * UPDATE USER STATUS
 * ============================================================
 *
 * Used by Admin User Management.
 */

export async function updateUserStatus(uid, status) {
  if (!uid) {
    throw new Error("User UID is required.");
  }

  const allowedStatuses = ["active", "suspended"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid user status.");
  }

  await updateDoc(doc(db, "users", uid), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/*
 * ============================================================
 * UPDATE ADMIN-MANAGED USER FIELDS
 * ============================================================
 *
 * Keeps admin operations limited to fields that should
 * actually be managed from User Management.
 */

export async function updateManagedUser(uid, data) {
  if (!uid) {
    throw new Error("User UID is required.");
  }

  const allowedFields = ["role", "status"];

  const updates = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  if (updates.role !== undefined) {
    const allowedRoles = ["consumer", "farmer", "admin"];

    if (!allowedRoles.includes(updates.role)) {
      throw new Error("Invalid user role.");
    }
  }

  if (updates.status !== undefined) {
    const allowedStatuses = ["active", "suspended"];

    if (!allowedStatuses.includes(updates.status)) {
      throw new Error("Invalid user status.");
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No valid user fields to update.");
  }

  await updateDoc(doc(db, "users", uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/*
 * ============================================================
 * DELETE USER PROFILE
 * ============================================================
 *
 * IMPORTANT:
 * This deletes only users/{uid}.
 * It does NOT delete the Firebase Authentication account.
 */

export async function deleteUserProfile(uid) {
  if (!uid) {
    throw new Error("User UID is required.");
  }

  await deleteDoc(doc(db, "users", uid));
}

/*
 * ============================================================
 * SUBSCRIBE TO USERS
 * ============================================================
 *
 * Used by the Admin User Management page.
 */

export function subscribeUsers(callback, onError) {
  if (!callback) {
    return () => {};
  }

  const usersQuery = query(
    usersRef,
    orderBy("createdAt", "desc"),
    limit(USER_PAGE_SIZE),
  );

  return onSnapshot(
    usersQuery,
    (snapshot) => {
      const users = snapshot.docs.map((userDoc) => ({
        uid: userDoc.id,
        ...userDoc.data(),
      }));

      callback(users);
    },
    (error) => {
      console.error("Failed to subscribe to users:", error);

      onError?.(error);
    },
  );
}

/*
 * ============================================================
 * SEARCH USERS
 * ============================================================
 */

export async function searchUsers(search, currentUserId) {
  const keyword = search.trim().toLowerCase();

  if (!keyword) return [];

  const fullnameQuery = query(
    usersRef,
    where("fullnameLower", ">=", keyword),
    where("fullnameLower", "<=", keyword + "\uf8ff"),
    limit(10),
  );

  const usernameQuery = query(
    usersRef,
    where("username", ">=", keyword),
    where("username", "<=", keyword + "\uf8ff"),
    limit(10),
  );

  const [fullnameSnapshot, usernameSnapshot] = await Promise.all([
    getDocs(fullnameQuery),
    getDocs(usernameQuery),
  ]);

  const users = new Map();

  [...fullnameSnapshot.docs, ...usernameSnapshot.docs].forEach((userDoc) => {
    if (userDoc.id === currentUserId) {
      return;
    }

    users.set(userDoc.id, {
      uid: userDoc.id,
      ...userDoc.data(),
    });
  });

  return [...users.values()];
}

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function removeUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  );
}
