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

    farmName: "",
    description: "",

    verification: {
      status: "unverified",
      group: null,
      verifiedAt: null,
      verifiedBy: null
    },

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

function removeUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}
