import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
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

export async function sendVerificationEmail(user = null) {
  const targetUser = user || auth.currentUser;
  if (!targetUser) {
    throw new Error("No authenticated user found to send verification email.");
  }
  await sendEmailVerification(targetUser);
}

export async function reloadUser(user = null) {
  const targetUser = user || auth.currentUser;
  if (!targetUser) {
    return null;
  }
  await reload(targetUser);
  return targetUser;
}

export function getCurrentUser() {
  return auth.currentUser;
}
