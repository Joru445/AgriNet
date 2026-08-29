import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
  fetchSignInMethodsForEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithCredential,
  PhoneAuthProvider,
} from "firebase/auth";
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  limit,
  updateDoc,
} from "firebase/firestore";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

/**
 * Checks whether an email is already associated with an account
 */
export async function checkEmailAvailability(email) {
  const cleanEmail = email ? email.trim().toLowerCase() : "";
  if (!cleanEmail) {
    return { available: false, error: "Email is required." };
  }

  // 1. Primary check: Firebase Auth fetchSignInMethodsForEmail
  try {
    const signInMethods = await fetchSignInMethodsForEmail(auth, cleanEmail);
    if (signInMethods && signInMethods.length > 0) {
      return { available: false, error: "This email is already registered." };
    }
  } catch (authError) {
    console.debug("fetchSignInMethodsForEmail fallback:", authError?.code);
  }

  // 2. Secondary check: Query Firestore 'users' collection for existing email
  try {
    const q = query(
      collection(db, "users"),
      where("email", "==", cleanEmail),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { available: false, error: "This email is already registered." };
    }
  } catch (dbError) {
    console.debug("Firestore email check skipped/error:", dbError);
  }

  return { available: true };
}

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

/**
 * Initializes a fresh Firebase invisible RecaptchaVerifier for each SMS attempt.
 * A single-use fresh token prevents 'too-many-requests' caused by token reuse.
 */
export function getOrCreatePhoneRecaptcha(containerId = "recaptcha-container", onSolved, onExpired) {
  if (typeof window === "undefined") return null;

  // Clean up any previously used verifier to guarantee a fresh single-use token
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (_) {}
    window.recaptchaVerifier = null;
  }

  const containerElement = document.getElementById(containerId);
  if (!containerElement) {
    console.warn(`reCAPTCHA container #${containerId} not found in DOM`);
    return null;
  }

  try {
    containerElement.innerHTML = "";
    const freshNode = document.createElement("div");
    freshNode.id = `rc-${Date.now()}`;
    containerElement.appendChild(freshNode);

    window.recaptchaVerifier = new RecaptchaVerifier(auth, freshNode, {
      size: "invisible",
      callback: (response) => {
        onSolved?.(response);
      },
      "expired-callback": () => {
        resetPhoneRecaptcha(containerId);
        onExpired?.();
      },
    });

    return window.recaptchaVerifier;
  } catch (error) {
    console.error("Failed to initialize RecaptchaVerifier:", error);
    return null;
  }
}

export function resetPhoneRecaptcha(containerId = "recaptcha-container") {
  if (typeof window === "undefined") return;
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (_) {}
    window.recaptchaVerifier = null;
  }
  const containerElement = document.getElementById(containerId);
  if (containerElement) {
    containerElement.innerHTML = "";
  }
}

export const initPhoneRecaptcha = getOrCreatePhoneRecaptcha;

/**
 * Sends an SMS verification code to the specified phone number using PhoneAuthProvider.
 * Does not create or sign into another account.
 *
 * @param {string} phoneNumber E.164 formatted phone number (+639XXXXXXXXX)
 * @param {RecaptchaVerifier} appVerifier
 * @returns {Promise<string>} verificationId
 */
export async function sendPhoneVerificationOtp(phoneNumber, appVerifier) {
  if (!phoneNumber) {
    throw new Error("Phone number is required.");
  }
  if (!appVerifier) {
    throw new Error("reCAPTCHA verifier is not initialized.");
  }

  // signInWithPhoneNumber performs the full client reCAPTCHA handshake and requests the SMS OTP
  const confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    appVerifier
  );

  return confirmationResult;
}

/**
 * Verifies the OTP code and links the phone credential directly to the CURRENT authenticated user.
 * Updates Firestore users/{uid}.phone upon successful verification.
 *
 * @param {string|Object} sessionOrId verificationId string or confirmation session object
 * @param {string} verificationCode 6-digit SMS code
 * @param {string} normalizedPhone Verified E.164 phone number
 * @param {User} user Optional user instance (defaults to auth.currentUser)
 * @returns {Promise<User>}
 */
export async function verifyAndLinkPhone(sessionOrId, verificationCode, normalizedPhone, user = null) {
  const currentUser = user || auth.currentUser;
  if (!currentUser) {
    throw new Error("No authenticated user found to link phone number.");
  }

  const verificationId =
    typeof sessionOrId === "string"
      ? sessionOrId
      : sessionOrId?.verificationId;

  if (!verificationId) {
    throw new Error("Invalid phone verification session.");
  }
  if (!verificationCode || verificationCode.trim().length < 6) {
    throw new Error("Please enter a valid 6-digit verification code.");
  }

  // 1. Build phone credential with PhoneAuthProvider.credential(verificationId, otp)
  const phoneCredential = PhoneAuthProvider.credential(
    verificationId,
    verificationCode.trim()
  );

  // 2. Link phone credential to the CURRENT authenticated user
  await linkWithCredential(currentUser, phoneCredential);

  // 3. Reload Firebase User so phoneNumber and providerData are updated in memory
  await reload(currentUser);

  // 4. Update Firestore users/{uid}.phone with the verified phone number
  try {
    const userDocRef = doc(db, "users", currentUser.uid);
    await updateDoc(userDocRef, {
      phone: normalizedPhone,
    });
  } catch (dbError) {
    console.warn("Firestore user phone update after verification note:", dbError);
  }

  return currentUser;
}
