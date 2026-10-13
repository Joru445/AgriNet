import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signInWithCustomToken, signOut } from "firebase/auth";

import { auth } from "../firebase/auth";
import { login } from "../services/login.service";
import { getSavedAccounts, saveAccount } from "../services/savedAccounts.service";
import {
  activateRetainedSession,
  getRetainedSessionStatus,
} from "../services/multiAccountSession.service";
import {
  authenticateWithPasskey,
  PasskeyError,
  PasskeyErrorType,
} from "../services/webauthn.service";
import {
  signInWithProvider,
  getSocialSignInErrorMessage,
} from "../services/auth.service";
import { getRoleHome } from "../utils/routes";
import { validateLoginForm } from "../utils/validators";
import { showToast } from "../utils/toast";
import { t } from "../i18n";

const EMPTY_ERRORS = { email: "", password: "", general: "" };

// ── Account-switch intent (module-scoped so it survives React StrictMode
// ── double-mounting in development) ───────────────────────────────────────
//
// When Saved Accounts switches to a password account, useSavedAccounts stores
// the target email in sessionStorage BEFORE signing out. SessionStorage (not a
// query param) is used because route guards fire <Navigate to="/login"> after
// signOut, which can overwrite query-parameter navigation. The Login page reads
// this intent once on mount.
let consumedSwitchEmail;

function getSwitchEmail() {
  if (consumedSwitchEmail === undefined) {
    consumedSwitchEmail = sessionStorage.getItem("agrinet_switch_email") || "";
    if (consumedSwitchEmail) {
      sessionStorage.removeItem("agrinet_switch_email");
    }
  }
  return consumedSwitchEmail;
}

function clearSwitchEmail() {
  consumedSwitchEmail = "";
  sessionStorage.removeItem("agrinet_switch_email");
}

/**
 * View modes:
 *   "saved"    — saved-account selector (initial when accounts exist)
 *   "password" — password-only form for a specific saved account
 *   "login"    — normal full login form (email/password/social)
 */
export function useLoginForm() {
  const [savedAccounts] = useState(() => getSavedAccounts());
  const hasSavedAccounts = savedAccounts.length > 0;

  // Initial view state: an account switch (sessionStorage — primary) or an
  // ?email= query param (direct links — fallback) that matches a saved account
  // opens the password-only form directly. Solved at init (not in an effect) so
  // there is no flash of the wrong view.
  const targetEmail =
    getSwitchEmail() ||
    new URLSearchParams(window.location.search).get("email") ||
    "";
  const switchAccount = targetEmail
    ? savedAccounts.find((a) => a.email === targetEmail) || null
    : null;

  const [form, setForm] = useState(() => ({
    email: targetEmail || "",
    password: "",
  }));
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [loading, setLoading] = useState(false);
  const [socialAuthInFlight, setSocialAuthInFlight] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState(null);
  const passkeyFailedAccountRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // "saved" → saved accounts, "password" → password form, "login" → full form
  const [viewMode, setViewMode] = useState(() => {
    if (targetEmail) return switchAccount ? "password" : "login";
    return hasSavedAccounts ? "saved" : "login";
  });

  // Track which saved account is being password-authenticated
  const [passwordAccount, setPasswordAccount] = useState(() =>
    switchAccount || null,
  );

  // Pre-fill email from query param (?email=...) — used for direct links.
  // If the email matches a saved account, open the password-only form.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setForm({ email: emailParam, password: "" });
      setErrors(EMPTY_ERRORS);
      setPasskeyError(null);
      const matchingAccount = savedAccounts.find((a) => a.email === emailParam) || null;
      setPasswordAccount(matchingAccount);
      setViewMode(matchingAccount ? "password" : "login");
    }
  }, [location.search, savedAccounts]);

  // ── Saved-account actions ──────────────────────────────────────────

  /** Password account clicked → show password-only form */
  const activateQuickSession = useCallback(async (account) => {
    if (!account?.uid) return false;
    if (await getRetainedSessionStatus(account.uid) !== "available") return false;
    try {
      await activateRetainedSession(account.uid);
      clearSwitchEmail();
      navigate(getRoleHome(account.role), { replace: true });
      return true;
    } catch {
      return false;
    }
  }, [navigate]);

  const handleSelectSavedAccount = useCallback(async (account) => {
    if (await activateQuickSession(account)) return;
    setPasswordAccount(account);
    setForm((prev) => ({ ...prev, email: account.email, password: "" }));
    setErrors(EMPTY_ERRORS);
    setPasskeyError(null);
    setViewMode("password");
  }, [activateQuickSession]);

  /** Passkey account clicked → start passkey auth immediately */
  const handleSelectPasskeyAccount = useCallback(
    async (account) => {
      if (passkeyLoading || loading) return;
      if (await activateQuickSession(account)) return;

      setPasskeyLoading(true);
      setPasskeyError(null);
      setErrors(EMPTY_ERRORS);

      try {
        const result = await authenticateWithPasskey(account.email);

        if (!result?.customToken) {
          passkeyFailedAccountRef.current = account;
          setPasskeyError(t("auth.errors.passkeyFailed"));
          return;
        }

        await signInWithCustomToken(auth, result.customToken);
        if (auth.currentUser?.uid !== account.uid) {
          await signOut(auth);
          setPasskeyError("This passkey belongs to a different saved account.");
          return;
        }
      } catch (error) {
        passkeyFailedAccountRef.current = account;

        if (
          error instanceof PasskeyError &&
          error.type === PasskeyErrorType.CANCELLED
        ) {
          setPasskeyError(t("auth.errors.passkeyCancelled"));
          return;
        }
        if (error.name === "NotAllowedError") {
          setPasskeyError(t("auth.errors.passkeyCancelled"));
          return;
        }

        if (error instanceof PasskeyError) {
          setPasskeyError(error.message);
        } else {
          setPasskeyError(t("auth.errors.passkeyFailed"));
        }
      } finally {
        setPasskeyLoading(false);
      }
    },
    [passkeyLoading, loading, activateQuickSession],
  );

  // ── Social login ─────────────────────────────────────────────────

  const initiateSocialLogin = useCallback(
    async (method, expectedAccount = null) => {
      if (method !== "google" && method !== "facebook") return;
      if (socialAuthInFlight || loading || passkeyLoading) return;
      if (expectedAccount && await activateQuickSession(expectedAccount)) return;

      setSocialAuthInFlight(true);

      try {
        const credential = await signInWithProvider(method, { selectAccount: method === "google" });
        if (expectedAccount && credential.user.uid !== expectedAccount.uid) {
          await signOut(auth);
          throw new Error("The selected provider account does not match the saved account.");
        }
        const providers = [...new Set(credential.user.providerData
          .map((item) => item.providerId)
          .filter((provider) => ["password", "google.com", "facebook.com"].includes(provider)))];
        saveAccount({
          uid: credential.user.uid,
          email: credential.user.email || "",
          displayName: credential.user.displayName || "",
          username: "",
          avatar: credential.user.photoURL || "",
          role: "consumer",
          provider: providers[0] || (method === "google" ? "google.com" : "facebook.com"),
          providers,
        });
        // Firebase Auth state updates → AuthContext picks up → navigate happens
      } catch (error) {
        if (
          error.code === "auth/popup-closed-by-user" ||
          error.code === "auth/cancelled-popup-request"
        ) {
          return;
        }
        setErrors({
          ...EMPTY_ERRORS,
          general: getSocialSignInErrorMessage(error, method),
        });
      } finally {
        setSocialAuthInFlight(false);
      }
    },
    [socialAuthInFlight, loading, passkeyLoading, activateQuickSession],
  );

  /** Social account clicked → start Google/Facebook auth */
  const handleSelectSocialAccount = useCallback(
    async (account, provider = account.provider) => {
      const method = provider === "google.com" ? "google" : "facebook";
      initiateSocialLogin(method, account);
    },
    [initiateSocialLogin],
  );

  /** Retry passkey for the account that failed */
  const handlePasskeyRetry = useCallback(() => {
    const account = passkeyFailedAccountRef.current;
    if (!account) return;
    setPasskeyError(null);
    passkeyFailedAccountRef.current = null;
    handleSelectPasskeyAccount(account);
  }, [handleSelectPasskeyAccount]);

  // ── Navigation between views ───────────────────────────────────────

  /** "Use another account" → normal login form */
  const handleUseAnotherAccount = useCallback(() => {
    clearSwitchEmail();
    setForm((prev) => ({ ...prev, email: "", password: "" }));
    setErrors(EMPTY_ERRORS);
    setPasskeyError(null);
    setPasswordAccount(null);
    setViewMode("login");
  }, []);

  /** "Back to saved accounts" from any view */
  const handleBackToSaved = useCallback(() => {
    clearSwitchEmail();
    setErrors(EMPTY_ERRORS);
    setPasskeyError(null);
    setPasswordAccount(null);
    setForm((prev) => ({ ...prev, password: "" }));
    setViewMode("saved");
  }, []);

  // ── Normal login form handlers ─────────────────────────────────────

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  /** Submit password-only form (saved account or normal login) */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (socialAuthInFlight || passkeyLoading) {
      setErrors({
        ...EMPTY_ERRORS,
        general: t("auth.login.waitingForProvider"),
      });
      return;
    }

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
        setErrors({ ...EMPTY_ERRORS, general: t("auth.errors.accountRole") });
        return;
      }

      if (passwordAccount && user?.uid !== passwordAccount.uid) {
        await signOut(auth);
        setErrors({ ...EMPTY_ERRORS, general: "This password belongs to a different saved account." });
        return;
      }

      // Remember the successful account without retaining its password or any
      // provider credential. This is distinct from Firebase session persistence.
      if (user?.uid) {
        const providers = [...new Set(user.providerData?.map((item) => item.providerId)
          .filter((provider) => ["password", "google.com", "facebook.com"].includes(provider)) || [])];
        saveAccount({
          uid: user.uid,
          email: user.email || form.email,
          displayName: profile.fullname || profile.displayName || user.displayName || "",
          username: profile.username || "",
          avatar: profile.profilePicture || profile.avatar || user.photoURL || "",
          role: profile.role || "consumer",
          provider: providers[0] || "password",
          providers,
        });
      }

      if (profile.status === "suspended") {
        navigate("/suspended", { replace: true });
        return;
      }

      const phoneVerified = Boolean(
        user?.phoneNumber ||
          user?.providerData?.some((p) => p.providerId === "phone"),
      );

      if (!phoneVerified) {
        showToast.info(t("auth.errors.verifyPhone"));
        navigate("/verify-account", { replace: true });
        return;
      }

      clearSwitchEmail();

      const from = location.state?.from;
      let targetPath = null;

      if (from) {
        const pathname = typeof from === "string" ? from : from.pathname || "";
        const search =
          typeof from === "object" && from.search ? from.search : "";
        const hash = typeof from === "object" && from.hash ? from.hash : "";

        const publicRoutes = [
          "/login",
          "/register",
          "/forgot-password",
          "/landing",
          "/suspended",
          "/",
        ];
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
    passkeyLoading,
    passkeyError,
    socialAuthInFlight,
    savedAccounts,
    hasSavedAccounts,
    viewMode,
    passwordAccount,
    handleChange,
    handleSubmit,
    handleSelectSavedAccount,
    handleSelectSocialAccount,
    handleSelectPasskeyAccount,
    activateQuickSession,
    handlePasskeyRetry,
    handleUseAnotherAccount,
    handleBackToSaved,
    initiateSocialLogin,
  };
}
