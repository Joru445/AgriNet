import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { apiRequest } from "./api/api.client";

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
  try {
    const [farmersSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, "farmers")),
      getDocs(query(collection(db, "users"), where("role", "==", "farmer"))),
    ]);

    const farmerMap = new Map();

    usersSnap.docs.forEach((doc) => {
      const data = doc.data();
      farmerMap.set(doc.id, {
        uid: doc.id,
        ...data,
        rating: Number(data.rating || 0),
        reviewCount: Number(data.reviewCount || 0),
      });
    });

    farmersSnap.docs.forEach((doc) => {
      const existing = farmerMap.get(doc.id) || {};
      const data = doc.data();
      const rating = Number(data.rating ?? existing.rating ?? 0);
      const reviewCount = Number(data.reviewCount ?? existing.reviewCount ?? 0);

      farmerMap.set(doc.id, {
        ...existing,
        uid: doc.id,
        ...data,
        rating,
        reviewCount,
      });
    });

    return Array.from(farmerMap.values());
  } catch (error) {
    console.error("Error fetching farmers:", error);
    return [];
  }
}

import { setCachedUserProfile } from "../utils/userProfileCache";

export async function getFarmerById(uid) {
  const [farmerSnap, userSnap] = await Promise.all([
    getDoc(doc(db, "farmers", uid)),
    getDoc(doc(db, "users", uid)),
  ]);

  if (!farmerSnap.exists() && !userSnap.exists()) {
    throw new Error("Farmer not found.");
  }

  const userData = userSnap.exists() ? userSnap.data() : {};
  const farmerData = farmerSnap.exists() ? farmerSnap.data() : {};

  const rating = farmerData.rating || userData.rating || 0;
  const reviewCount = farmerData.reviewCount || userData.reviewCount || 0;

  const farmerResult = {
    uid,
    ...userData,
    ...farmerData,
    rating,
    reviewCount,
    verified: farmerData.verified === true || userData.verified === true,
  };

  setCachedUserProfile(uid, farmerResult);

  return farmerResult;
}

/**
 * Verify or unverify a farmer via the backend API.
 *
 * Verification data belongs to the
 * farmers collection, not users. The server derives
 * the admin identity from the token.
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
