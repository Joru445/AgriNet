import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { apiRequest } from "./api/api.client";
import { setCachedUserProfile } from "../utils/userProfileCache";

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

export async function getFarmers() {
  const result = await apiRequest("/farmers");
  return result.data || [];
}

export async function getFarmerDashboard() {
  const result = await apiRequest("/farmers/dashboard");
  return result.data;
}

export async function apiGetFarmerInquiryAnalytics({ from, to }) {
  const params = new URLSearchParams({ from, to });
  const result = await apiRequest(`/farmers/dashboard/inquiry-analytics?${params.toString()}`);
  return result.data;
}

export async function apiGetFarmerProductAnalytics() {
  const result = await apiRequest("/farmers/dashboard/product-analytics");
  return result.data;
}

export async function getFarmerById(uid) {
  if (!uid) {
    throw new Error("Farmer UID is required.");
  }

  try {
    const result = await apiRequest(`/farmers/${uid}`);
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

  const result = await apiRequest(`/admin/farmers/${uid}/verification`, {
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
  const result = await apiRequest("/farmers/verification");
  return result.data;
}

/**
 * Submit a verification application.
 */
export async function submitVerification() {
  const result = await apiRequest("/farmers/verification", {
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
  const result = await apiRequest(`/admin/farmer-verifications${query ? `?${query}` : ""}`);
  return result.data;
}

/**
 * Get a specific farmer verification application (admin only).
 */
export async function apiGetFarmerVerificationById(farmerId) {
  const result = await apiRequest(`/admin/farmer-verifications/${farmerId}`);
  return result.data;
}

/**
 * Approve a farmer verification (admin only).
 */
export async function apiApproveFarmerVerification(farmerId) {
  const result = await apiRequest(`/admin/farmer-verifications/${farmerId}/approve`, {
    method: "POST",
  });
  return result.data;
}

/**
 * Reject a farmer verification (admin only).
 */
export async function apiRejectFarmerVerification(farmerId, reason) {
  const result = await apiRequest(`/admin/farmer-verifications/${farmerId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return result.data;
}
