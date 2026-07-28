import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "../firebase/auth";

export async function register(email, password) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return credential.user;
}

export async function login(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);

  return credential.user;
}

export function logout() {
  return signOut(auth);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}
