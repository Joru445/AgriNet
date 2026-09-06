import * as authService from "./auth.service";
import * as userService from "./user.service";
import * as farmerService from "./farmer.service";

/**
 * Creates common AgriNet user and role profiles in Firestore.
 * Reusable across all authentication methods (Email/Password, Google, Facebook).
 *
 * @param {import("firebase/auth").User} user Authenticated Firebase user
 * @param {Object} profileData Profile details collected during registration
 * @returns {Promise<import("firebase/auth").User>}
 */
export async function createAgriNetProfile(user, profileData) {
  if (!user?.uid) {
    throw new Error("Authenticated user with a valid UID is required to create a profile.");
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
  });

  if (profileData.role === "farmer") {
    await farmerService.createFarmerProfile({
      uid: user.uid,
      fullname: profileData.fullname,
      fullnameLower: profileData.fullname.toLowerCase(),
      username: profileData.username.toLowerCase(),
      email: profileData.email || user.email || "",
      location: profileData.location,
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
