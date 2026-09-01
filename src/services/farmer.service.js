import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export async function createFarmerProfile(data) {
  await setDoc(doc(db, "farmers", data.uid), {
    uid: data.uid,

    fullname: data.fullname,
    fullnameLower: data.fullnameLower,
    username: data.username,
    email: data.email,

    profilePicture: "",
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

export async function updateFarmer(uid, data) {
  const farmerRef = doc(db, "farmers", uid);

  await updateDoc(farmerRef, removeUndefined(data));
}

/**
 * Verify or unverify a farmer.
 *
 * Verification data belongs to the
 * farmers collection, not users.
 */
export async function setFarmerVerification(uid, verified, adminUid) {
  if (!uid) {
    throw new Error("Farmer UID is required.");
  }

  if (!adminUid) {
    throw new Error("Admin UID is required.");
  }

  if (typeof verified !== "boolean") {
    throw new Error("Verification value must be true or false.");
  }

  const farmerRef = doc(db, "farmers", uid);

  await updateDoc(farmerRef, {
    verified,

    verifiedAt: verified ? serverTimestamp() : null,

    verifiedBy: verified ? adminUid : null,

    updatedAt: serverTimestamp(),
  });

  return {
    uid,
    verified,
  };
}

/**
 * Verify a farmer.
 */
export async function verifyFarmer(uid, adminUid) {
  return setFarmerVerification(uid, true, adminUid);
}

/**
 * Revoke farmer verification.
 */
export async function unverifyFarmer(uid, adminUid) {
  return setFarmerVerification(uid, false, adminUid);
}

function removeUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  );
}
