import * as authService from "./auth.service";
import * as userService from "./user.service";
import * as farmerService from "./farmer.service";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firestore";

/**
 * Creates common AgriNet user and role profiles in Firestore.
 * Reusable across all authentication methods (Email/Password, Google, Facebook).
 *
 * Never re-creates or overwrites an existing profile: the authenticated
 * Firebase user is the identity and users/{uid} is the single source of truth
 * for role, username, phone, status, farmer data and timestamps, so an
 * existing account is left untouched.
 *
 * @param {import("firebase/auth").User} user Authenticated Firebase user
 * @param {Object} profileData Profile details collected during registration
 * @returns {Promise<import("firebase/auth").User>}
 */
export async function createAgriNetProfile(user, profileData) {
  if (!user?.uid) {
    throw new Error("Authenticated user with a valid UID is required to create a profile.");
  }

  const existingSnap = await getDoc(doc(db, "users", user.uid));
  if (existingSnap.exists()) {
    return user;
  }

  await userService.createUser({
    uid: user.uid,
    fullname: profileData.fullname,
    fullnameLower: profileData.fullname.toLowerCase(),
    username: profileData.username.toLowerCase(),
    email: profileData.email || user.email || "",
    phone: profileData.contactNumber || profileData.phone || "",
    role: profileData.role,
    location: profileData.location,
    profilePicture: profileData.profilePicture || "",
  });

  if (profileData.role === "farmer") {
    await farmerService.createFarmerProfile({
      uid: user.uid,
      fullname: profileData.fullname,
      fullnameLower: profileData.fullname.toLowerCase(),
      username: profileData.username.toLowerCase(),
      email: profileData.email || user.email || "",
      location: profileData.location,
      profilePicture: profileData.profilePicture || "",
    });
  }

  return user;
}

/**
 * Full Email/Password registration:
 * 1. Creates Firebase Auth user credentials
 * 2. Creates AgriNet Firestore profile via createAgriNetProfile
 * 3. Sends email verification (if applicable)
 *
 * @param {Object} form Registration form data
 * @returns {Promise<import("firebase/auth").User>}
 */
export async function register(form) {
  const user = await authService.register(form.email, form.password);

  await createAgriNetProfile(user, form);

  try {
    await authService.sendVerificationEmail(user);
  } catch (emailError) {
    console.warn("Verification email sending failed during registration:", emailError);
  }

  return user;
}

/**
 * Completes AgriNet profile setup for an already-authenticated Facebook user.
 *
 * Firebase Auth is the source of truth for Facebook identity, so the email and
 * UID come from the authenticated Firebase user rather than client input.
 * The role remains an AgriNet registration property supplied by the form.
 *
 * @param {import("firebase/auth").User} user Authenticated Facebook Firebase user
 * @param {Object} form Registration form data
 * @returns {Promise<import("firebase/auth").User>}
 */
export async function createFacebookProfile(user, form) {
  if (!user?.uid) {
    throw new Error("Authenticated user with a valid UID is required to create a profile.");
  }

  const profileData = {
    ...form,
    email: user.email || form.email || "",
    profilePicture: user.photoURL || "",
  };

  await createAgriNetProfile(user, profileData);

  return user;
}

/**
 * Completes AgriNet profile setup for an already-authenticated Google user.
 *
 * Firebase Auth is the source of truth for Google identity, so the email and
 * UID come from the authenticated Firebase user rather than client input.
 * The role remains an AgriNet registration property supplied by the form.
 *
 * @param {import("firebase/auth").User} user Authenticated Google Firebase user
 * @param {Object} form Registration form data
 * @returns {Promise<import("firebase/auth").User>}
 */
export async function createGoogleProfile(user, form) {
  if (!user?.uid) {
    throw new Error("Authenticated user with a valid UID is required to create a profile.");
  }

  const profileData = {
    ...form,
    email: user.email || form.email || "",
    profilePicture: user.photoURL || "",
  };

  await createAgriNetProfile(user, profileData);

  return user;
}
