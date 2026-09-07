import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { apiRequest } from "./api/api.client";

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

    profilePicture: data.profilePicture || "",
    profilePictureId: data.profilePictureId || "",

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
 * GET USER PROFILE
 * ============================================================
 */

import { getCachedUserProfile, setCachedUserProfile } from "../utils/userProfileCache";

export async function getUserProfile(uid) {
  if (!uid || typeof uid !== "string") {
    throw new Error("Invalid user UID.");
  }

  const cached = getCachedUserProfile(uid);

  if (cached) {
    return cached;
  }

  const userRef = doc(db, "users", uid);

  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    try {
      const farmerSnap = await getDoc(doc(db, "farmers", uid));
      if (farmerSnap.exists()) {
        const farmerData = farmerSnap.data();
        const res = {
          uid: farmerSnap.id,
          ...farmerData,
          role: farmerData.role || "farmer",
          verified: farmerData.verified === true,
        };
        setCachedUserProfile(uid, res);
        return res;
      }
    } catch {
      /* noop */
    }
    return null;
  }

  const data = snapshot.data();
  let profilePicture = data.profilePicture || "";
  let profilePictureId = data.profilePictureId || "";
  let verified = data.verified === true;

  if (data.role === "farmer" || !profilePicture) {
    try {
      const farmerSnap = await getDoc(doc(db, "farmers", uid));
      if (farmerSnap.exists()) {
        const farmerData = farmerSnap.data();
        if (farmerData?.verified === true) {
          verified = true;
        }
        if (!profilePicture && farmerData?.profilePicture) {
          profilePicture = farmerData.profilePicture;
        }
        if (!profilePictureId && farmerData?.profilePictureId) {
          profilePictureId = farmerData.profilePictureId;
        }
      }
    } catch {
      /* noop */
    }
  }

  const userResult = {
    uid: snapshot.id,
    ...data,
    profilePicture,
    profilePictureId,
    verified,
  };

  setCachedUserProfile(uid, userResult);

  return userResult;
}

/*
 * ============================================================
 * UPDATE MY PROFILE (BACKEND)
 * ============================================================
 *
 * The server derives the user identity from the token and updates the
 * user profile (and farmer profile fields when the user is a farmer).
 * Protected fields (role, status, uid, rating, ...) are ignored server-side.
 */

export async function updateMyProfile(data) {
  const result = await apiRequest("/users/me/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return result.user;
}

/*
 * ============================================================
 * SYNC CONSUMER TRANSACTION STATS (BACKEND)
 * ============================================================
 *
 * The server recomputes completedDeals / totalDeals / cancelledDeals
 * from the consumer's inquiries and writes them only when changed.
 * Replaces the old client-side getDocs + updateDoc fan-out.
 */

export async function apiSyncTransactionStats() {
  const result = await apiRequest("/users/me/transaction-stats", {
    method: "PATCH",
  });

  return {
    completedDeals: result.completedDeals,
    totalDeals: result.totalDeals,
    cancelledDeals: result.cancelledDeals,
  };
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
 *
 * Migrated to the Express backend (GET /users/search). The server
 * ranges over fullnameLower/username and batch-enriches farmer docs,
 * replacing the old per-result getDoc fan-out. The caller is excluded
 * server-side.
 */

export async function searchUsers(search) {
  const keyword = String(search || "").trim();

  if (!keyword) {
    return [];
  }

  const params = new URLSearchParams();
  params.set("q", keyword);

  const result = await apiRequest(`/users/search?${params.toString()}`);

  return result.users ?? [];
}
