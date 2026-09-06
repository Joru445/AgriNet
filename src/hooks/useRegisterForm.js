import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { register } from "../services/register.service";
import { checkEmailAvailability } from "../services/auth.service";
import {
  validateStep1,
  validateStep2,
  validateStep3,
  requiresPasswordStep,
} from "../utils/registerValidation";
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

export default function useRegisterForm() {
  const navigate = useNavigate();

  const [registrationMethod, setRegistrationMethod] = useState(null);
  const [authProviderData, setAuthProviderData] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [checkedEmail, setCheckedEmail] = useState("");

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
  }, []);

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
  const selectRegistrationMethod = useCallback((method) => {
    if (method === "email") {
      setRegistrationMethod("email");
      setStep(1);
    } else if (method === "google") {
      showToast.info(t("auth.register.googleComingSoon"));
    } else if (method === "facebook") {
      showToast.info(t("auth.register.facebookComingSoon"));
    }
  }, []);

  /**
   * Resets registration back to method selection
   */
  const resetRegistrationMethod = useCallback(() => {
    setRegistrationMethod(null);
    setAuthProviderData(null);
    setStep(1);
  }, []);

  /**
   * Navigates back to previous step, or back to method selection if on Step 1
   */
  function previousStep() {
    if (step <= 1) {
      setRegistrationMethod(null);
      setAuthProviderData(null);
      setStep(1);
    } else if (step === 3 && !requiresPasswordStep(registrationMethod)) {
      setStep(1);
    } else {
      setStep((prev) => Math.max(prev - 1, 1));
    }
  }

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

      await register({ ...form, registrationMethod });

      showToast.success(t("auth.register.createdToast"));

      navigate("/verify-account", { replace: true });
    } catch (error) {
      console.error("Registration error:", error);

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
