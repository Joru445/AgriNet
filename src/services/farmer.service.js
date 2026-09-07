import {
  doc,
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

    createdAt: serverTimestamp(),
  });
}

export async function getFarmers() {
  const result = await apiRequest("/farmers");
  return result.data || [];
}

export async function getFarmerById(uid) {
  const result = await apiRequest(`/farmers/${uid}`);
  const farmer = result.data;

  if (!farmer) {
    throw new Error("Farmer not found.");
  }

  setCachedUserProfile(uid, farmer);

  return farmer;
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
