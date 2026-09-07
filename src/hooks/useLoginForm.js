import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { login } from "../services/login.service";
import {
  SOCIAL_AUTH_TAB_SOURCE,
  getSocialSignInErrorMessage,
  openSocialAuthTab,
} from "../services/auth.service";
import { getRoleHome } from "../utils/routes";
import { validateLoginForm } from "../utils/validators";
import { showToast } from "../utils/toast";
import { t } from "../i18n";

const EMPTY_ERRORS = { email: "", password: "", general: "" };

export function useLoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [loading, setLoading] = useState(false);
  const [socialAuthInFlight, setSocialAuthInFlight] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Tracks the currently open Google/Facebook authentication attempt so only
  // its handler tab's result is consumed by this login tab (mirrors the
  // registration flow's gating so unrelated tabs can't consume results).
  const nextAuthAttemptIdRef = useRef(0);
  const pendingAuthAttemptRef = useRef(null);

  /**
   * Opens the dedicated provider authentication tab from this click. The login
   * tab is never redirected; the authenticated result arrives via the "message"
   * listener and through Firebase cross-tab auth persistence.
   */
  const initiateSocialLogin = useCallback(
    (method) => {
      if (method !== "google" && method !== "facebook") return;
      if (socialAuthInFlight || loading) return;

      nextAuthAttemptIdRef.current += 1;
      const attemptId = String(nextAuthAttemptIdRef.current);
      pendingAuthAttemptRef.current = attemptId;

      if (!openSocialAuthTab(method, attemptId)) {
        pendingAuthAttemptRef.current = null;
        setErrors({ ...EMPTY_ERRORS, general: t("auth.errors.allowPopups") });
        return;
      }

      setSocialAuthInFlight(true);
    },
    [socialAuthInFlight, loading],
  );

  /**
   * Receives the result reported by the Google/Facebook handler tab (/auth/google,
   * /auth/facebook). The listener validates origin and source exactly like the
   * registration flow. Identity, profile and status are NOT handled here: they
   * flow through AuthContext + the route guards (existing account -> role home,
   * phone missing -> /verify-account, suspended -> /suspended, no AgriNet
   * profile -> /register to complete setup). Login never creates a profile.
   */
  useEffect(() => {
    function handleSocialAuthMessage(event) {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.source !== SOCIAL_AUTH_TAB_SOURCE) return;

      if (
        data.socialAttempt == null ||
        data.socialAttempt !== pendingAuthAttemptRef.current
      ) {
        return;
      }

      if (data.type === "auth-error" && data.code === "auth/popup-blocked") {
        // The handler tab stays open offering Retry. Keep this attempt in
        // flight until the retry resolves or the tab is closed.
        setErrors({ ...EMPTY_ERRORS, general: t("auth.errors.allowPopups") });
        return;
      }

      pendingAuthAttemptRef.current = null;
      setSocialAuthInFlight(false);

      if (data.type === "auth-success") {
        // Nothing further to do: onAuthStateChanged in AuthContext propagates
        // the sign-in into this tab and the route guards pick the correct
        // destination. A successful provider authentication is never reported
        // as a login failure even when no AgriNet profile exists yet.
      } else if (data.type === "auth-error") {
        setErrors({
          ...EMPTY_ERRORS,
          general: getSocialSignInErrorMessage({ code: data.code }, data.method),
        });
      } else if (data.type === "auth-cancelled") {
        setErrors({
          ...EMPTY_ERRORS,
          general: t(`auth.errors.${data.method}Cancelled`),
        });
      }
    }

    window.addEventListener("message", handleSocialAuthMessage);
    return () =>
      window.removeEventListener("message", handleSocialAuthMessage);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // One authentication flow at a time: if a provider tab is open, wait for
    // it instead of starting an email/password sign-in underneath it.
    if (socialAuthInFlight) {
      setErrors({ ...EMPTY_ERRORS, general: t("auth.login.waitingForProvider") });
      return;
    }

    // Client-side validation runs before we ever hit the network.
    const validationErrors = validateLoginForm(form);
    if (validationErrors.email || validationErrors.password) {
      setErrors(validationErrors);
      return;
    }

    setErrors(EMPTY_ERRORS);

    try {
      setLoading(true);

      const { user, profile } = await login(form);

      if (!profile?.role) {
        setErrors({
          ...EMPTY_ERRORS,
          general: t("auth.errors.accountRole"),
        });
        return;
      }

      if (profile.status === "suspended") {
        navigate("/suspended", { replace: true });
        return;
      }

      const phoneVerified = Boolean(
        user?.phoneNumber ||
        user?.providerData?.some((p) => p.providerId === "phone")
      );

      if (!phoneVerified) {
        showToast.info(t("auth.errors.verifyPhone"));
        navigate("/verify-account", { replace: true });
        return;
      }

      const from = location.state?.from;
      let targetPath = null;

      if (from) {
        const pathname = typeof from === "string" ? from : from.pathname || "";
        const search = typeof from === "object" && from.search ? from.search : "";
        const hash = typeof from === "object" && from.hash ? from.hash : "";

        const publicRoutes = ["/login", "/register", "/forgot-password", "/landing", "/suspended", "/"];
        if (!publicRoutes.includes(pathname) && pathname.startsWith("/")) {
          const role = profile.role;
          const isAdminRoute = pathname.startsWith("/admin");
          const isFarmerRoute = pathname.startsWith("/farmer");
          const isConsumerRoute = !isAdminRoute && !isFarmerRoute;

          if (
            (role === "admin" && isAdminRoute) ||
            (role === "farmer" && isFarmerRoute) ||
            (role === "consumer" && isConsumerRoute)
          ) {
            targetPath = `${pathname}${search}${hash}`;
          }
        }
      }

      navigate(targetPath || getRoleHome(profile.role), { replace: true });
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/invalid-credential":
          setErrors({
            ...EMPTY_ERRORS,
            password: t("auth.errors.invalidCredentials"),
          });
          break;

        case "auth/too-many-requests":
          setErrors({
            ...EMPTY_ERRORS,
            password: t("auth.errors.tooManyAttempts"),
          });
          break;

        default:
          setErrors({
            ...EMPTY_ERRORS,
            general: t("auth.errors.signInFailed"),
          });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    loading,
    socialAuthInFlight,
    initiateSocialLogin,
    handleChange,
    handleSubmit,
  };
}
