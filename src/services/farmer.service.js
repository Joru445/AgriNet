import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { auth } from "../firebase/auth";
import { apiRequest } from "./api/api.client";
import { setCachedUserProfile } from "../utils/userProfileCache";
import { getFarmerProducts } from "./product.service";
import { getFarmerReviews } from "./farmer-review.service";

export async function createFarmerProfile(data) {
  await setDoc(doc(db, "farmers", data.uid), {
    uid: data.uid,

    fullname: data.fullname,
    fullnameLower: data.fullnameLower,
    username: data.username,
    email: data.email,

    profilePicture: data.profilePicture || "",
    profilePictureId: "",

    description: "",

    location: data.location,

    rating: 0,
    verified: false,
    verificationStatus: "not_applied",

    createdAt: serverTimestamp(),
  });
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
  const result = await apiRequest(`/v1/farmers${qs ? `?${qs}` : ""}`);
  return {
    farmers: result.data || [],
    cursor: result.pagination?.cursor ?? null,
    hasMore: result.pagination?.hasMore ?? false,
  };
}

export async function getFarmerDashboard(farmerId = null) {
  try {
    const result = await apiRequest("/v1/farmers/dashboard");
    if (result?.data) {
      return result.data;
    }
  } catch (err) {
    console.warn("[FarmerDashboard] Backend API unavailable, computing from Firebase Firestore:", err?.message);
  }

  const uid = farmerId || auth.currentUser?.uid;
  if (!uid) {
    return { summary: {}, recentProducts: [], recentReviews: [] };
  }

  try {
    // 1. Products
    const products = await getFarmerProducts(uid).catch(() => []);
    const totalProducts = products.length;
    let availableProducts = 0;
    let unavailableProducts = 0;
    let preorderCount = 0;

    products.forEach((p) => {
      const isPreorder = p.sellingMode === "preorder" || Boolean(p.preorder);
      if (isPreorder) preorderCount++;
      const isAvail = p.available !== false && (isPreorder || Number(p.stock) > 0);
      if (isAvail) availableProducts++;
      else unavailableProducts++;
    });

    // 2. Inquiries
    let inquiries = [];
    try {
      const inqRef = collection(db, "inquiries");
      const inqQuery = query(inqRef, where("farmerId", "==", uid));
      const inqSnap = await getDocs(inqQuery);
      inquiries = inqSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn("[FarmerDashboard] Inquiries fetch fallback error:", e);
    }

    let pendingInquiries = 0;
    let acceptedInquiries = 0;
    let reservedInquiries = 0;
    let ongoingInquiries = 0;
    let completedInquiries = 0;
    let cancelledInquiries = 0;

    inquiries.forEach((inq) => {
      const st = inq.status;
      if (st === "pending") pendingInquiries++;
      else if (st === "accepted") acceptedInquiries++;
      else if (st === "reserved") reservedInquiries++;
      else if (st === "completed") completedInquiries++;
      else if (st === "cancelled" || st === "rejected") cancelledInquiries++;

      if (st === "ongoing" || st === "accepted" || st === "reserved") {
        ongoingInquiries++;
      }
    });

    // 3. Reviews
    let reviews = [];
    reviews = await getFarmerReviews(uid).catch(() => []);

    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? Number(
            (
              reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) /
              reviewCount
            ).toFixed(1),
          )
        : 0;

    return {
      summary: {
        products: {
          total: totalProducts,
          available: availableProducts,
          unavailable: unavailableProducts,
          preorder: preorderCount,
        },
        reviews: {
          average: averageRating,
          count: reviewCount,
        },
        inquiries: {
          total: inquiries.length,
          pending: pendingInquiries,
          accepted: acceptedInquiries,
          reserved: reservedInquiries,
          ongoing: ongoingInquiries,
          completed: completedInquiries,
          cancelled: cancelledInquiries,
        },
      },
      recentProducts: products.slice(0, 4),
      recentReviews: reviews.slice(0, 4),
    };
  } catch (fallbackError) {
    console.error("[FarmerDashboard] Firestore fallback failed:", fallbackError);
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
    const result = await apiRequest(`/v1/farmers/${uid}`);
    const farmer = result.data;

    if (farmer) {
      setCachedUserProfile(uid, { ...farmer, role: "farmer" });
      return farmer;
    }
  } catch {
    // API request failed; fallback to direct Firestore read
  }

  try {
    const farmerDoc = await getDoc(doc(db, "farmers", uid));
    if (farmerDoc.exists()) {
      const farmerData = { uid: farmerDoc.id, role: "farmer", ...farmerDoc.data() };
      setCachedUserProfile(uid, farmerData);
      return farmerData;
    }
  } catch (firestoreErr) {
    console.error("Firestore fallback getFarmerById failed:", firestoreErr);
  }

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
