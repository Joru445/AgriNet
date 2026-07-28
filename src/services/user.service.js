import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  limit,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

const usersRef = collection(db, "users");

export async function createUser(data) {
  await setDoc(doc(db, "users", data.uid), {
    uid: data.uid,

    fullName: data.fullName,
    email: data.email,
    role: data.role,

    profilePicture: "/default.png",
    profilePictureId: "",

    contactNumber: "",
    bio: "",

    location: {
      address: "",
      lat: null,
      lng: null,
    },

    createdAt: serverTimestamp(),
  });
}

export async function getUsers() {
  const snapshot = await getDocs(usersRef);

  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  }));
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    throw new Error("User not found.");
  }

  return {
    uid: snapshot.id,
    ...snapshot.data(),
  };
}

export async function updateUser(uid, data) {
  await updateDoc(doc(db, "users", uid), removeUndefined((data)));
}

function removeUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

export async function searchUsers(search, currentUserId) {
  const keyword = search.trim().toLowerCase();

  if (!keyword) return [];

  const fullnameQuery = query(
    usersRef,
    where("fullnameLower", ">=", keyword),
    where("fullnameLower", "<=", keyword + "\uf8ff"),
    limit(10)
  );

  const usernameQuery = query(
    usersRef,
    where("username", ">=", keyword),
    where("username", "<=", keyword + "\uf8ff"),
    limit(10)
  );

  const [fullnameSnapshot, usernameSnapshot] = await Promise.all([
    getDocs(fullnameQuery),
    getDocs(usernameQuery),
  ]);

  const users = new Map();

  [...fullnameSnapshot.docs, ...usernameSnapshot.docs].forEach((doc) => {
    if (doc.id === currentUserId) return;

    users.set(doc.id, {
      uid: doc.id,
      ...doc.data(),
    });
  });

  return [...users.values()];
}