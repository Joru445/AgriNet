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

    createdAt: serverTimestamp(),
  });
}

export async function getFarmers() {
  const result = await apiRequest("/farmers");
  return result.data || [];
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
