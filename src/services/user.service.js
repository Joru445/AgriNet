import { apiRequest } from "./api/api.client";
import { getCachedUserProfile, setCachedUserProfile } from "../utils/userProfileCache";
import { invalidatePrefix } from "../utils/pageCache";

const USER_PAGE_SIZE = 100;

/*
 * ============================================================
 * CREATE USER
 * ============================================================
 */

export async function createUser(data) {
  const result = await apiRequest("/v1/users", { method: "POST", body: JSON.stringify(data) });
  return result.user;
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
    // apiRequest forwards the current Firebase token when one exists; the API
    // derives viewer identity from that token instead of accepting a spoofable
    // requester UID query parameter.
    const result = await apiRequest(`/v1/users/${uid}`, { requireAuth: false });
    const profile = result.user;

    if (profile && profile.role) {
      setCachedUserProfile(uid, profile);
      return profile;
    }
  } catch {}

  return cached || null;
}

// This endpoint is intentionally public-safe even for the owner. It powers
// public pages and "View as others" without reading owner-only cache fields.
export async function getPublicProfile(uid) {
  if (!uid || typeof uid !== "string") throw new Error("Invalid user UID.");
  const result = await apiRequest(`/v1/users/public/${encodeURIComponent(uid)}`, { requireAuth: false });
  return result.data ?? null;
}

export async function getPublicProfileByUsername(username) {
  if (!username || typeof username !== "string") throw new Error("Invalid username.");
  const result = await apiRequest(`/v1/users/by-username/${encodeURIComponent(username)}`, { requireAuth: false });
  return result.data ?? null;
}

/*
 * ============================================================
 * UPDATE MY PROFILE (BACKEND)
 * ============================================================
 */

export async function updateMyProfile(data) {
  const result = await apiRequest("/v1/users/me/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (result.user?.uid) {
    setCachedUserProfile(result.user.uid, result.user);
    invalidatePrefix("publicProfile:");
  }
  return result.user;
}

/*
 * ============================================================
 * SYNC CONSUMER TRANSACTION STATS (BACKEND)
 * ============================================================
 */

export async function apiSyncTransactionStats() {
  const result = await apiRequest("/v1/users/me/transaction-stats", {
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
 * SUBSCRIBE TO USERS (authorized backend refresh)
 * ============================================================
 *
 * Used by the Admin User Management page.
 */

export function subscribeUsers(callback, onError) {
  if (!callback) {
    return () => {};
  }

  let closed = false;
  const load = async () => {
    try {
      const result = await apiRequest(`/v1/users?limit=${USER_PAGE_SIZE}`);
      if (!closed) callback(result.users || []);
    } catch (error) { if (!closed) onError?.(error); }
  };
  load();
  const timer = setInterval(load, 30_000);
  return () => { closed = true; clearInterval(timer); };
}

/*
 * ============================================================
 * SEARCH USERS (via backend API)
 * ============================================================
 */

export async function searchUsers(search, { includeSelf = false } = {}) {
  const keyword = String(search || "").trim().toLowerCase();

  if (!keyword) {
    return [];
  }

  const params = new URLSearchParams();
  params.set("q", keyword);

  if (includeSelf) {
    params.set("includeSelf", "true");
  }

  const result = await apiRequest(`/v1/users/search?${params.toString()}`);

  return result.users ?? [];
}
