import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
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
  const snapshot = await getDocs(collection(db, "farmers"));

  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  }));
}

export async function getFarmerById(uid) {
  const farmerRef = doc(db, "farmers", uid);

  const snapshot = await getDoc(farmerRef);

  if (!snapshot.exists()) {
    throw new Error("Farmer not found.");
  }

  return {
    uid: snapshot.id,
    ...snapshot.data(),
  };
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
