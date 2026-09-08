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
import { getCachedUserProfile, setCachedUserProfile } from "../utils/userProfileCache";

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
 * GET USER PROFILE (via backend API with Firestore fallback)
 * ============================================================
 */

export async function getUserProfile(uid, requesterUid) {
  if (!uid || typeof uid !== "string") {
    throw new Error("Invalid user UID.");
  }

  const cached = getCachedUserProfile(uid, requesterUid);
  if (cached && cached.role) {
    return cached;
  }

  try {
    const endpoint = requesterUid && requesterUid !== uid
      ? `/users/${uid}?requester=${requesterUid}`
      : `/users/${uid}`;

    const result = await apiRequest(endpoint);
    const profile = result.user;

    if (profile && profile.role) {
      setCachedUserProfile(uid, profile);
      return profile;
    }
  } catch {
    // API failed or unavailable; fallback to direct Firestore document read
  }

  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = { uid: userDoc.id, ...userDoc.data() };
      setCachedUserProfile(uid, userData);
      return userData;
    }
  } catch (firestoreErr) {
    console.error("Firestore fallback getUserProfile failed:", firestoreErr);
  }

  return cached || null;
}

/*
 * ============================================================
 * UPDATE MY PROFILE (BACKEND)
 * ============================================================
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
 * SUBSCRIBE TO USERS (intentional Firebase realtime)
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
 * SEARCH USERS (via backend API)
 * ============================================================
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
