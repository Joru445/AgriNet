import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "../firebase/auth";
import { useAuth } from "../context/AuthContext";

import { register, createFacebookProfile, createGoogleProfile } from "../services/register.service";
import {
  signInWithProvider,
  checkEmailAvailability,
  getCurrentUser,
  getSocialSignInErrorMessage,
  resolveSocialAccountStatus,
  SOCIAL_ACCOUNT_STATUS,
} from "../services/auth.service";
import {
  validateStep1,
  validateStep2,
  validateStep3,
  requiresPasswordStep,
} from "../utils/registerValidation";
import { getRoleHome } from "../utils/routes";
import { showToast } from "../utils/toast";
import { t } from "../i18n";

const INITIAL_FORM = {
  role: "consumer",

  fullname: "",
  username: "",

  email: "",

  password: "",
  confirmPassword: "",

  contactNumber: "",

  bio: "",

  location: {
    address: "",
    lat: null,
    lng: null,
  },
};

// How long the social submit waits for Firebase auth state to propagate from
// the handler tab into this registration tab before giving up.
const SOCIAL_USER_WAIT_TIMEOUT_MS = 2000;

/**
 * Resolves with the currently authenticated Firebase user, waiting briefly for
 * Firebase cross-tab auth persistence to propagate right after a successful
 * provider sign-in. Prefers onAuthStateChanged over a fixed sleep and never
 * hangs the form: after the timeout it rejects.
 */
function waitForCurrentUser(timeoutMs = SOCIAL_USER_WAIT_TIMEOUT_MS) {
  const current = getCurrentUser();
  if (current) return Promise.resolve(current);

  return new Promise((resolve, reject) => {
    let settled = false;
    let unsub = () => {};

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      unsub();
      reject(new Error("Social sign-in session expired. Please sign in again."));
    }, timeoutMs);

    unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser || settled) return;
      settled = true;
      clearTimeout(timer);
      unsub();
      resolve(firebaseUser);
    });
  });
}

export default function useRegisterForm() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [registrationMethod, setRegistrationMethod] = useState(null);
  const [authProviderData, setAuthProviderData] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [checkedEmail, setCheckedEmail] = useState("");
  const [socialAuthInFlight, setSocialAuthInFlight] = useState(false);

  /**
   * Explicit control of the social registration resolution state:
   *   null       -> nothing pending; an authenticated social user without a
   *                 profile may (re)start resolution (popup success, refresh
   *                 mid-setup)
   *   "checking" -> existence check against Firebase is in flight
   *   "dismissed"-> the user deliberately backed out of an in-progress social
   *                 registration; do not auto-resume the form until they
   *                 explicitly pick a provider again
   */
  const [socialResolution, setSocialResolution] = useState(null);

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);

  const isEmailReadOnly = Boolean(authProviderData?.email);

  /**
   * Prefills registration fields from an authenticated OAuth provider
   */
  const setProviderData = useCallback((providerData) => {
    setAuthProviderData(providerData);
    if (providerData) {
      setForm((prev) => ({
        ...prev,
        fullname: providerData.displayName || prev.fullname,
        email: providerData.email || prev.email,
        ...(providerData.username ? { username: providerData.username } : {}),
      }));
    }
  }, []);

  /**
   * After a Google/Facebook sign-in resolves (or on a refresh mid-setup),
   * determines whether the authenticated provider user may continue a NEW
   * AgriNet registration — and only then shows the prefilled form.
   *
   * The provider identity always comes from Firebase (user.providerData) and
   * is never assumed to be a new registration based on the email alone.
   *   - existing AgriNet profile      -> existing account, sign in (navigate)
   *   - email on another auth method  -> conflict, direct to Login
   *   - cannot verify                 -> abort, never continue registration
   *   - otherwise                     -> NEW registration, prefill and continue
   */
  useEffect(() => {
    if (!user || profile || registrationMethod || socialResolution !== null) {
      return;
    }

    const providerId = user.providerData?.[0]?.providerId;
    const method =
      providerId === "facebook.com"
        ? "facebook"
        : providerId === "google.com"
          ? "google"
          : null;
    if (!method) return;

    let cancelled = false;
    setSocialResolution("checking");

    resolveSocialAccountStatus(user, method)
      .then(async (resolution) => {
        if (cancelled) return;

        if (resolution.status === SOCIAL_ACCOUNT_STATUS.EXISTS) {
          // Existing account: the provider sign-in already authenticated them.
          // Never show the registration form and never duplicate the profile.
          setSocialResolution("dismissed");
          const existing = resolution.profile || {};
          showToast.success(t("auth.signedInExisting"));

          if (existing.status === "suspended") {
            navigate("/suspended", { replace: true });
            return;
          }

          // A profile without a role is a broken account; do not try to route
          // it (that would loop) and never re-register it.
          if (!existing.role) {
            showToast.error(t("auth.errors.accountRole"));
            await signOut(auth).catch(() => {});
            navigate("/login", { replace: true });
            return;
          }

          const phoneVerified = Boolean(
            user.phoneNumber ||
              user.providerData?.some((p) => p.providerId === "phone"),
          );
          if (phoneVerified) {
            navigate(getRoleHome(existing.role), { replace: true });
          } else {
            navigate("/verify-account", { replace: true });
          }
          return;
        }

        if (resolution.status === SOCIAL_ACCOUNT_STATUS.CONFLICT) {
          // Same email already exists under another sign-in method. Do not
          // continue registration and never create a second Firebase account.
          setSocialResolution("dismissed");
          showToast.error(t("auth.errors.accountExistsDifferentCredential"));
          await signOut(auth).catch(() => {});
          navigate("/login", { replace: true });
          return;
        }

        if (resolution.status === SOCIAL_ACCOUNT_STATUS.UNKNOWN) {
          setSocialResolution("dismissed");
          showToast.error(t("auth.errors.socialCheckFailed"));
          return;
        }

        // status === "new": safe to continue profile registration.
        setSocialResolution(null);
        setRegistrationMethod(method);
        setStep(1);
        setProviderData({
          displayName: user.displayName || user.email?.split("@")[0] || "",
          email: user.email || "",
          username: null,
          photoURL: user.photoURL || "",
        });
      })
      .catch((error) => {
        console.error("Failed to resolve social registration:", error);
        if (!cancelled) setSocialResolution("dismissed");
        showToast.error(t("auth.errors.socialCheckFailed"));
      });

    return () => {
      cancelled = true;
    };
  }, [user, profile, registrationMethod, socialResolution, navigate, setProviderData]);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Updates a form field value and performs live validation for touched fields
   */
  const updateField = useCallback((name, value) => {
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // Invalidate checked email cache if email changed
      if (name === "email") {
        setCheckedEmail("");
      }

      // Live validation for the touched field
      setErrors((prevErrors) => {
        const nextErrors = { ...prevErrors };

        if (name === "fullname" || name === "username" || name === "email") {
          const step1Errors = validateStep1(updated);
          if (step1Errors[name]) {
            nextErrors[name] = step1Errors[name];
          } else {
            delete nextErrors[name];
          }
        } else if (name === "password" || name === "confirmPassword") {
          const step2Errors = validateStep2(updated, { registrationMethod });
          if (step2Errors[name]) {
            nextErrors[name] = step2Errors[name];
          } else {
            delete nextErrors[name];
          }
          // Also re-validate confirmPassword when password changes
          if (name === "password" && updated.confirmPassword) {
            if (step2Errors.confirmPassword) {
              nextErrors.confirmPassword = step2Errors.confirmPassword;
            } else {
              delete nextErrors.confirmPassword;
            }
          }
        } else if (name === "contactNumber") {
          const step3Errors = validateStep3(updated);
          if (step3Errors.contactNumber) {
            nextErrors.contactNumber = step3Errors.contactNumber;
          } else {
            delete nextErrors.contactNumber;
          }
        }

        return nextErrors;
      });

      return updated;
    });
  }, [registrationMethod]);

  /**
   * Marks a field as touched on blur
   */
  const setFieldTouched = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  /**
   * Updates location for farmer profile
   */
  const updateLocation = useCallback((location) => {
    setForm((prev) => {
      const updated = { ...prev, location };
      setErrors((prevErrors) => {
        const nextErrors = { ...prevErrors };
        if (location?.lat && location?.lng) {
          delete nextErrors.location;
        }
        return nextErrors;
      });
      return updated;
    });
    setTouched((prev) => ({ ...prev, location: true }));
  }, []);

  /**
   * Validates Step 1 and checks email availability asynchronously
   */
  async function handleStep1Continue() {
    // 1. Mark all Step 1 fields as touched
    setTouched((prev) => ({
      ...prev,
      fullname: true,
      username: true,
      email: true,
    }));

    // 2. Perform local validation
    const step1Errors = validateStep1(form);
    if (Object.keys(step1Errors).length > 0) {
      setErrors((prev) => ({ ...prev, ...step1Errors }));
      const firstError = Object.values(step1Errors)[0];
      showToast.error(firstError);
      return;
    }

    const cleanEmail = form.email.trim().toLowerCase();
    const nextStepNumber = requiresPasswordStep(registrationMethod) ? 2 : 3;

    // Social users whose provider supplied an email already authenticated with
    // that email, so it must not be re-checked. Social accounts without a
    // provider email (e.g. Facebook users without a public email) enter one
    // manually and go through the normal availability check below.
    if (
      (registrationMethod === "google" || registrationMethod === "facebook") &&
      isEmailReadOnly
    ) {
      setCheckedEmail(cleanEmail);
      setStep(nextStepNumber);
      return;
    }

    // 3. If email was already checked and hasn't changed, advance immediately
    if (checkedEmail && checkedEmail === cleanEmail) {
      setStep(nextStepNumber);
      return;
    }

    // 4. Check email availability with loading indicator
    try {
      setIsCheckingEmail(true);
      const result = await checkEmailAvailability(cleanEmail);

      if (!result.available) {
        setErrors((prev) => ({
          ...prev,
          email: result.error || t("auth.errors.emailTaken"),
        }));
        showToast.error(result.error || t("auth.errors.emailTaken"));
        return;
      }

      // Email is available!
      setCheckedEmail(cleanEmail);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
      setStep(nextStepNumber);
    } catch (err) {
      console.error("Email availability check error:", err);
      // If network fails, show error and remain on Step 1
      showToast.error(t("auth.errors.emailCheckFailed"));
    } finally {
      setIsCheckingEmail(false);
    }
  }

  /**
   * Validates Step 2 (Password)
   */
  function handleStep2Continue() {
    // 1. Mark Step 2 fields as touched
    setTouched((prev) => ({
      ...prev,
      password: true,
      confirmPassword: true,
    }));

    // 2. Local validation
    const step2Errors = validateStep2(form);
    if (Object.keys(step2Errors).length > 0) {
      setErrors((prev) => ({ ...prev, ...step2Errors }));
      const firstError = Object.values(step2Errors)[0];
      showToast.error(firstError);
      return;
    }

    // Clear step 2 errors and proceed to Step 3
    setErrors((prev) => {
      const next = { ...prev };
      delete next.password;
      delete next.confirmPassword;
      return next;
    });
    setStep(3);
  }

  /**
   * Generic nextStep handler that delegates to appropriate step validator
   */
  function nextStep() {
    if (step === 1) {
      handleStep1Continue();
    } else if (step === 2) {
      handleStep2Continue();
    }
  }

  /**
   * Handles selection of registration method
   */
  const selectRegistrationMethod = useCallback(
    (method) => {
      if (method === "email") {
        setRegistrationMethod("email");
        setStep(1);
        return;
      }

      if (method === "google" || method === "facebook") {
        if (socialAuthInFlight) return;

        // Explicitly allow (re)starting the existence check for the provider
        // account the moment the popup resolves. This also re-enables
        // auto-resume when the user picks a provider again after dismissing.
        setSocialResolution(null);
        setSocialAuthInFlight(true);

        signInWithProvider(method)
          .catch((error) => {
            if (
              error.code === "auth/popup-closed-by-user" ||
              error.code === "auth/cancelled-popup-request"
            ) {
              return;
            }

            // The email already belongs to an account using another sign-in
            // method. Never continue registration and never create a duplicate.
            if (error.code === "auth/account-exists-with-different-credential") {
              showToast.error(getSocialSignInErrorMessage(error, method));
              navigate("/login", { replace: true });
              return;
            }

            showToast.error(getSocialSignInErrorMessage(error, method));
          })
          .finally(() => {
            setSocialAuthInFlight(false);
          });
      }
    },
    [socialAuthInFlight, navigate],
  );

  /**
   * Resets registration back to method selection. Deliberately dismisses any
   * in-progress social resolution so an authenticated provider user is not
   * instantly pushed back into the registration form until they pick a method
   * again.
   */
  const resetRegistrationMethod = useCallback(() => {
    setRegistrationMethod(null);
    setAuthProviderData(null);
    setSocialResolution("dismissed");
    setStep(1);
  }, []);

  /**
   * Navigates back to previous step, or back to method selection if on Step 1
   */
  function previousStep() {
    if (step <= 1) {
      setRegistrationMethod(null);
      setAuthProviderData(null);
      setSocialResolution("dismissed");
      setStep(1);
    } else if (step === 3 && !requiresPasswordStep(registrationMethod)) {
      setStep(1);
    } else {
      setStep((prev) => Math.max(prev - 1, 1));
    }
  }

  /**
   * Explicit, controlled exit from the registration flow. Always returns to a
   * public route and never leaves the user trapped.
   *
   * Signing out only happens when a provider sign-in created an incomplete
   * (profile-less) auth session; fully registered users keep their session.
   *
   * @param {string} destination Public route: "/landing", "/login", etc.
   */
  const cancelRegistration = useCallback(
    async (destination = "/landing") => {
      setRegistrationMethod(null);
      setAuthProviderData(null);
      setSocialResolution("dismissed");
      setStep(1);
      setCheckedEmail("");

      // Clear any ephemeral provider session that has no AgriNet profile yet.
      if (user && !profile) {
        try {
          await signOut(auth);
        } catch (signOutError) {
          console.warn("Failed to sign out during registration cancel:", signOutError);
        }
      }

      navigate(destination, { replace: true });
    },
    [user, profile, navigate],
  );

  /**
   * Validates Step 3 and submits registration to Firebase
   */
  async function submit() {
    // 1. Mark Step 3 fields as touched
    setTouched((prev) => ({
      ...prev,
      contactNumber: true,
      location: true,
    }));

    // 2. Validate Step 3
    const step3Errors = validateStep3(form);
    if (Object.keys(step3Errors).length > 0) {
      setErrors((prev) => ({ ...prev, ...step3Errors }));
      const firstError = Object.values(step3Errors)[0];
      showToast.error(firstError);
      return;
    }

    // 3. Also safeguard Step 1 and Step 2 validations
    const step1Errors = validateStep1(form);
    if (Object.keys(step1Errors).length > 0) {
      setStep(1);
      setErrors((prev) => ({ ...prev, ...step1Errors }));
      showToast.error(t("auth.errors.fixStep1"));
      return;
    }

    if (requiresPasswordStep(registrationMethod)) {
      const step2Errors = validateStep2(form, { registrationMethod });
      if (Object.keys(step2Errors).length > 0) {
        setStep(2);
        setErrors((prev) => ({ ...prev, ...step2Errors }));
        showToast.error(t("auth.errors.fixStep2"));
        return;
      }
    }

    try {
      setLoading(true);

      // Google/Facebook users authenticate in the handler tab, so profile
      // creation uses the already-authenticated Firebase user. Cross-tab auth
      // persistence can lag briefly after the auth-success message, so wait
      // for Firebase auth state before continuing.
      if (registrationMethod === "google" || registrationMethod === "facebook") {
        const firebaseUser = await waitForCurrentUser();
        if (!firebaseUser) {
          throw new Error("Social sign-in session expired. Please sign in again.");
        }

        if (registrationMethod === "google") {
          await createGoogleProfile(firebaseUser, form);
          showToast.success(t("auth.register.createdToastGoogle"));
        } else {
          await createFacebookProfile(firebaseUser, form);
          showToast.success(t("auth.register.createdToastFacebook"));
        }

        navigate("/verify-account", { replace: true });
        return;
      }

      await register({ ...form, registrationMethod });

      showToast.success(t("auth.register.createdToast"));

      navigate("/verify-account", { replace: true });
    } catch (error) {
      console.error("Registration error:", error);

      // Social users authenticate outside this form; show a friendly message.
      if (registrationMethod === "google" || registrationMethod === "facebook") {
        showToast.error(getSocialSignInErrorMessage(error, registrationMethod));
        return;
      }

      // Handle race condition or duplicate email error from Firebase
      if (
        error.code === "auth/email-already-in-use" ||
        error.message?.includes("email-already-in-use")
      ) {
        setStep(1);
        setErrors((prev) => ({
          ...prev,
          email: t("auth.errors.emailTakenUseOther"),
        }));
        setTouched((prev) => ({ ...prev, email: true }));
        setCheckedEmail("");
        showToast.error(t("auth.errors.emailTakenUseOther"));
      } else if (
        error.code === "auth/weak-password" ||
        error.message?.includes("weak-password")
      ) {
        setStep(2);
        setErrors((prev) => ({
          ...prev,
          password: t("auth.errors.weakPasswordLong"),
        }));
        setTouched((prev) => ({ ...prev, password: true }));
        showToast.error(t("auth.errors.weakPasswordShort"));
      } else {
        showToast.error(error.message || t("auth.errors.createFailed"));
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    registrationMethod,
    selectRegistrationMethod,
    setRegistrationMethod,
    resetRegistrationMethod,
    cancelRegistration,
    onExitToLogin: () => cancelRegistration("/login"),
    onExitToLanding: () => cancelRegistration("/landing"),

    socialAuthInFlight,
    socialResolution,
    authProviderData,
    setProviderData,
    isEmailReadOnly,
    requiresPasswordStep: requiresPasswordStep(registrationMethod),

    step,
    loading,
    isCheckingEmail,

    form,
    errors,
    touched,

    showPassword,

    updateField,
    setFieldTouched,
    updateLocation,

    nextStep,
    previousStep,

    handleStep1Continue,
    handleStep2Continue,

    submit,

    setShowPassword,
  };
}
