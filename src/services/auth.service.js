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
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  linkWithPopup,
} from "firebase/auth";
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  limit,
  updateDoc,
} from "firebase/firestore";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";
import { t } from "../i18n";

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

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email");

/**
 * Opens the provider popup directly from the user's click.
 * Must be called synchronously from a click handler to avoid popup blocking.
 *
 * @param {string} method "google" | "facebook"
 * @param {Object} [options]
 * @param {string} [options.loginHint] Email hint for Google's account chooser
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function signInWithProvider(method, options = {}) {
  const provider =
    method === "google"
      ? googleProvider
      : method === "facebook"
        ? facebookProvider
        : null;

  if (!provider) throw new Error(`Unsupported provider: ${method}`);

  if (method === "google" && options.loginHint) {
    googleProvider.setCustomParameters({ login_hint: options.loginHint });
  }

  return signInWithPopup(auth, provider);
}

/**
 * Message envelope used by the social-auth handler tab to report back to the
 * registration tab that opened it. Both windows are same-origin.
 * @deprecated Used only by the handler-tab flow for registration.
 */
export const SOCIAL_AUTH_TAB_SOURCE = "agrinet-social-auth";
export const SOCIAL_AUTH_TAB_NAME = "agrinet-social-auth";
export const SOCIAL_AUTH_ROUTES = {
  google: "/auth/google",
  facebook: "/auth/facebook",
};

/**
 * Opens the dedicated provider authentication tab (Google/Facebook).
 * Must be called synchronously from the user's click to avoid popup blocking.
 * Opening a tab (rather than the current registration page redirecting) keeps
 * the registration flow intact.
 *
 * @param {string} method "google" | "facebook"
 * @param {string|null} [attemptId] Registration-flow attempt identifier the
 *   handler tab echoes back so only the registration tab that started this
 *   attempt consumes its result.
 * @returns {boolean} true if the tab was opened
 */
export function openSocialAuthTab(method, attemptId = null) {
  const route = SOCIAL_AUTH_ROUTES[method];
  if (!route || typeof window === "undefined") return false;

  const url = attemptId
    ? `${route}?socialAttempt=${encodeURIComponent(attemptId)}`
    : route;

  return Boolean(window.open(url, SOCIAL_AUTH_TAB_NAME));
}

/**
 * Reports an authentication result from the handler tab back to the
 * registration tab that opened it.
 *
 * @param {Object} payload { type: "auth-success" | "auth-error" | "auth-cancelled", method, ... }
 */
export function notifySocialAuthResult(payload) {
  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        { source: SOCIAL_AUTH_TAB_SOURCE, ...payload },
        window.location.origin,
      );
    }
  } catch {
    /* ignore cross-origin/closed opener */
  }
}

/**
 * Maps social authentication (Google/Facebook) errors to user-facing messages
 * using the centralized translation system. Raw Firebase error codes are never
 * shown directly to users.
 */
export function getSocialSignInErrorMessage(error, method = "google") {
  const isGoogle = method === "google";
  const key = (suffix) =>
    isGoogle
      ? `auth.errors.google${suffix}`
      : `auth.errors.facebook${suffix}`;

  switch (error?.code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/cancelled-popup":
    case "auth/user-cancelled":
      return t(key("Cancelled"));
    case "auth/popup-blocked":
      return t("auth.errors.allowPopups");
    case "auth/account-exists-with-different-credential":
      return t("auth.errors.accountExistsDifferentCredential");
    case "auth/network-request-failed":
    case "auth/timeout":
      return t("auth.errors.networkError");
    default:
      return t(key("SignInFailed"));
  }
}

/**
 * Maps Google authentication errors to user-facing messages using the
 * centralized translation system. Raw Firebase error codes are never
 * shown directly to users.
 */
export function getGoogleSignInErrorMessage(error) {
  return getSocialSignInErrorMessage(error, "google");
}

/**
 * Firebase providerIds used to identify sign-in methods linked to a user's
 * Firebase Auth account (exposed via user.providerData[].providerId).
 */
export const PROVIDER_IDS = {
  google: "google.com",
  facebook: "facebook.com",
  password: "password",
  phone: "phone",
};

/**
 * Outcome of resolving a just-authenticated social provider user before their
 * AgriNet registration form is allowed to continue.
 *
 *  - "exists"   -> the provider user already has an AgriNet profile. Treat as
 *                  an existing account: never show the registration form and
 *                  never create a duplicate profile.
 *  - "conflict" -> the user's email already belongs to another AgriNet account
 *                  (password/phone/other provider). Never create a duplicate
 *                  account for that email.
 *  - "new"      -> genuinely new provider account with no profile and no
 *                  competing sign-in method for the same email. Safe to
 *                  continue into profile registration.
 *  - "unknown"  -> the account could not be verified (network/permission).
 *                  Registering is too risky, so registration must NOT continue.
 */
export const SOCIAL_ACCOUNT_STATUS = {
  EXISTS: "exists",
  CONFLICT: "conflict",
  NEW: "new",
  UNKNOWN: "unknown",
};

/**
 * Decides whether a just-authenticated Google/Facebook user should continue a
 * NEW AgriNet registration or must be treated as an existing/conflicting
 * account.
 *
 * Firebase Auth (the authenticated provider user) is the source of truth for
 * the provider identity; the email alone is never used to assume a new
 * registration is allowed. Sign-in methods reported by Firebase (including
 * which provider owns the email) are checked alongside the AgriNet profile.
 *
 * @param {import("firebase/auth").User} user Authenticated Firebase user
 * @param {string} method "google" | "facebook"
 * @returns {Promise<{status: string, profile?: Object|null, signInMethods?: string[]}>}
 */
export async function resolveSocialAccountStatus(user, method) {
  const providerId = PROVIDER_IDS[method];

  if (!user?.uid) {
    return { status: SOCIAL_ACCOUNT_STATUS.UNKNOWN, signInMethods: [] };
  }

  let existingProfile = null;
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      existingProfile = { uid: snap.id, ...snap.data() };
    }
  } catch (error) {
    console.warn(
      "Failed to read AgriNet profile while resolving social registration:",
      error?.code || error?.message,
    );
  }

  // 1. An existing AgriNet profile means this provider account already exists.
  //    The provider sign-in that just completed IS the login; never continue
  //    into registration and never duplicate the profile.
  if (existingProfile) {
    return {
      status: SOCIAL_ACCOUNT_STATUS.EXISTS,
      profile: existingProfile,
      signInMethods: [],
    };
  }

  let signInMethods = [];
  let methodsCheckFailed = null;
  const email = user.email ? user.email.trim().toLowerCase() : "";

  if (email) {
    try {
      signInMethods = await fetchSignInMethodsForEmail(auth, email);
    } catch (error) {
      methodsCheckFailed = error;
      console.warn(
        "fetchSignInMethodsForEmail failed while resolving social registration:",
        error?.code || error?.message,
      );
    }
  }

  // 2. Without being able to confirm the email is unused elsewhere, continuing
  //    registration could create a second account for an email that already
  //    belongs to another auth method.
  if (email && methodsCheckFailed) {
    return { status: SOCIAL_ACCOUNT_STATUS.UNKNOWN, signInMethods: [] };
  }

  // 3. Providers without a public email (e.g. some Facebook accounts) cannot
  //    conflict by email; a missing profile is the only signal, so this is a
  //    new registration.
  if (!email) {
    return {
      status: SOCIAL_ACCOUNT_STATUS.NEW,
      signInMethods,
    };
  }

  // 4. The email already belongs to another sign-in method (password, phone,
  //    or another provider). Never continue registration and never create a
  //    second Firebase account for that email.
  const otherMethods = signInMethods.filter((id) => id !== providerId);
  if (otherMethods.length > 0) {
    return {
      status: SOCIAL_ACCOUNT_STATUS.CONFLICT,
      signInMethods,
    };
  }

  // 5. The email is not registered under any other method (or is only owned by
  //    this same provider without a profile — a cancelled mid-registration
  //    resume). Safe to continue profile registration.
  return { status: SOCIAL_ACCOUNT_STATUS.NEW, signInMethods };
}

/**
 * Returns the Firebase providerIds currently linked to an account.
 * providerData comes only from the authenticated Firebase session, never from
 * client-supplied data.
 */
export function getLinkedProviderIds(user = null) {
  const currentUser = user || auth.currentUser;
  if (!currentUser) return [];
  return (currentUser.providerData || []).map((p) => p.providerId);
}

/**
 * Whether the given provider (PROVIDER_IDS.google / PROVIDER_IDS.facebook) is
 * already linked to the account.
 */
export function isProviderLinked(providerId, user = null) {
  return getLinkedProviderIds(user).includes(providerId);
}

/**
 * Explicitly links an additional sign-in provider to the CURRENTLY
 * authenticated user (the account the user signed in as).
 *
 * Security properties:
 *  - Always bound to auth.currentUser; the provider credential comes from the
 *    provider's own consent popup, never from the client.
 *  - LINK-ONLY: never auto-links because emails match and never merges two
 *    Firebase accounts. It never mutates AgriNet's Firestore profile.
 *
 * @param {string} providerId PROVIDER_IDS.google | PROVIDER_IDS.facebook
 * @param {User} [user] Optional user instance (defaults to auth.currentUser)
 * @returns {Promise<User>}
 */
export async function linkProvider(providerId, user = null) {
  const currentUser = user || auth.currentUser;
  if (!currentUser) {
    throw new Error("No authenticated user found to link a sign-in method.");
  }

  const provider =
    providerId === PROVIDER_IDS.google
      ? googleProvider
      : providerId === PROVIDER_IDS.facebook
        ? facebookProvider
        : null;

  if (!provider) {
    throw new Error("Unsupported provider for linking.");
  }

  await linkWithPopup(currentUser, provider);

  // Reload so providerData is fresh in memory for the UI.
  await reload(currentUser);

  return currentUser;
}

/**
 * Maps social provider LINKING errors to user-facing messages using the
 * centralized translation system. Raw Firebase error codes are never shown
 * directly to users. Linking is additive: when the provider's credential
 * conflicts with a different account, no changes are made and the conflict is
 * reported.
 */
export function getSocialLinkErrorMessage(error, method = "google") {
  const isGoogle = method === "google";
  const key = (suffix) =>
    isGoogle
      ? `auth.errors.google${suffix}`
      : `auth.errors.facebook${suffix}`;

  switch (error?.code) {
    case "auth/credential-already-in-use":
    case "auth/account-exists-with-different-credential":
      return t(
        `auth.errors.${isGoogle ? "googleProviderConflict" : "facebookProviderConflict"}`
      );
    case "auth/provider-already-linked":
    case "auth/provider-already-linked-before":
      return t("auth.errors.providerAlreadyLinked");
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/cancelled-popup":
    case "auth/user-cancelled":
      return t("auth.errors.linkCancelled");
    case "auth/popup-blocked":
      return t("auth.errors.allowPopups");
    case "auth/network-request-failed":
    case "auth/timeout":
      return t("auth.errors.networkError");
    default:
      return t(key("LinkFailed"));
  }
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
    } catch {
      /* noop */
    }
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
    } catch {
      /* noop */
    }
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
