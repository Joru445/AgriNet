import { apiRequest } from "./api/api.client";
import { setCachedUserProfile } from "../utils/userProfileCache";

export async function createFarmerProfile(data) {
  // Created atomically by the Firebase-authenticated /v1/users bootstrap.
  return data;
}

export async function getFarmers({ hasProducts = false, lat, lng, maxDistance, cursor, limit } = {}) {
  const params = new URLSearchParams();
  if (hasProducts) params.set("hasProducts", "true");
  if (lat != null) params.set("lat", String(lat));
  if (lng != null) params.set("lng", String(lng));
  if (maxDistance != null) params.set("maxDistance", String(maxDistance));
  if (cursor) params.set("cursor", cursor);
  if (limit != null) params.set("limit", String(limit));
  const qs = params.toString();
  const result = await apiRequest(`/v1/farmers${qs ? `?${qs}` : ""}`, {
    requireAuth: false,
  });
  return {
    farmers: result.data || [],
    cursor: result.pagination?.cursor ?? null,
    hasMore: result.pagination?.hasMore ?? false,
  };
}

export async function getFarmerDashboard() {
  try {
    const result = await apiRequest("/v1/farmers/dashboard");
    return result?.data || { summary: {}, recentProducts: [], recentReviews: [] };
  } catch (err) {
    // Private dashboard data never falls back to Firestore: a backend outage
    // must leave a safe empty state rather than bypass device-session checks.
    console.warn("[FarmerDashboard] Backend API unavailable:", err?.message);
    return { summary: {}, recentProducts: [], recentReviews: [] };
  }
}

export async function apiGetFarmerInquiryAnalytics({ from, to }) {
  try {
    const params = new URLSearchParams({ from, to });
    const result = await apiRequest(`/v1/farmers/dashboard/inquiry-analytics?${params.toString()}`);
    return result.data ?? { points: [] };
  } catch (err) {
    console.warn("[FarmerAnalytics] Inquiry analytics API failed, fallback to empty:", err?.message);
    return { points: [] };
  }
}

export async function apiGetFarmerProductAnalytics() {
  try {
    const result = await apiRequest("/v1/farmers/dashboard/product-analytics");
    return result.data ?? { categories: [], sellingMode: {} };
  } catch (err) {
    console.warn("[FarmerAnalytics] Product analytics API failed, fallback to empty:", err?.message);
    return { categories: [], sellingMode: {} };
  }
}

export async function getFarmerById(uid) {
  if (!uid) {
    throw new Error("Farmer UID is required.");
  }

  try {
    const result = await apiRequest(`/v1/farmers/${uid}`, {
      requireAuth: false,
    });
    const farmer = result.data;

    if (farmer) {
      setCachedUserProfile(uid, { ...farmer, role: "farmer" });
      return farmer;
    }
  } catch {}

  return null;
}

/**
 * Verify or unverify a farmer via the backend API.
 */
export async function apiSetFarmerVerification(uid, verified) {
  if (!uid) {
    throw new Error("Farmer UID is required.");
  }

  if (typeof verified !== "boolean") {
    throw new Error("Verification value must be true or false.");
  }

  const result = await apiRequest(`/v1/admin/farmers/${uid}/verification`, {
    method: "PATCH",
    body: JSON.stringify({ verified }),
  });

  return result.farmer;
}

/**
 * Verify a farmer.
 */
export async function verifyFarmer(uid) {
  return apiSetFarmerVerification(uid, true);
}

/**
 * Revoke farmer verification.
 */
export async function unverifyFarmer(uid) {
  return apiSetFarmerVerification(uid, false);
}

/*
 * ============================================================
 * FARMER VERIFICATION WORKFLOW
 * ============================================================
 */

/**
 * Get the authenticated farmer's verification status.
 */
export async function getMyVerification() {
  const result = await apiRequest("/v1/farmers/verification");
  return result.data;
}

/**
 * Submit a verification application.
 */
export async function submitVerification() {
  const result = await apiRequest("/v1/farmers/verification", {
    method: "POST",
  });
  return result.data;
}

/*
 * ============================================================
 * ADMIN FARMER VERIFICATION
 * ============================================================
 */

/**
 * List farmer verification applications (admin only).
 */
export async function apiListFarmerVerifications({ status, limit, cursor } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (limit) params.set("limit", String(limit));
  if (cursor) params.set("cursor", cursor);

  const query = params.toString();
  const result = await apiRequest(`/v1/admin/farmer-verifications${query ? `?${query}` : ""}`);
  return result.data;
}

/**
 * Get a specific farmer verification application (admin only).
 */
export async function apiGetFarmerVerificationById(farmerId) {
  const result = await apiRequest(`/v1/admin/farmer-verifications/${farmerId}`);
  return result.data;
}

/**
 * Approve a farmer verification (admin only).
 */
export async function apiApproveFarmerVerification(farmerId) {
  const result = await apiRequest(`/v1/admin/farmer-verifications/${farmerId}/approve`, {
    method: "POST",
  });
  return result.data;
}

/**
 * Reject a farmer verification (admin only).
 */
export async function apiRejectFarmerVerification(farmerId, reason) {
  const result = await apiRequest(`/v1/admin/farmer-verifications/${farmerId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return result.data;
}
