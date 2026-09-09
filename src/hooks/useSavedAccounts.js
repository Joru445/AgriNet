import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, signInWithCustomToken } from "firebase/auth";

import { auth } from "../firebase/auth";
import { useAuth } from "../context/AuthContext";
import { signInWithProvider } from "../services/auth.service";
import { authenticateWithPasskey } from "../services/webauthn.service";
import {
  getSavedAccounts,
  saveAccount,
  removeAccount as removeSavedAccount,
} from "../services/savedAccounts.service";

/**
 * Determines the primary authentication provider from a Firebase User object.
 * Returns "password", "google.com", "facebook.com", or null.
 */
function getPrimaryProvider(user) {
  if (!user?.providerData?.length) return null;
  const providers = user.providerData.map((p) => p.providerId);
  if (providers.includes("password")) return "password";
  if (providers.includes("google.com")) return "google.com";
  if (providers.includes("facebook.com")) return "facebook.com";
  return providers[0] || null;
}

/**
 * Manages saved accounts and account switching.
 *
 * - saveCurrentAccount(profile?): saves/updates the current user's entry
 * - removeAccount(uid): removes a saved entry from the registry
 * - switchToAccount(account): signs out, then either opens social auth, passkey auth, or navigates to login
 * - switchWithPasskey(account): signs out, then authenticates with passkey
 * - navigateToLogin(account?): signs out current user, navigates to /login with email pre-filled
 *
 * Auto-saves the current user's profile when it first loads in a session.
 */
export function useSavedAccounts() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [savedAccounts, setSavedAccounts] = useState(() => getSavedAccounts());
  const savedUidRef = useRef(null);

  // Auto-save profile when it first loads (handles social auth and page refreshes)
  useEffect(() => {
    if (!profile?.uid) return;
    if (savedUidRef.current === profile.uid) return;
    savedUidRef.current = profile.uid;

    const provider = getPrimaryProvider(user);
    const updated = saveAccount({
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      avatar: profile.avatar,
      role: profile.role,
      provider,
    });
    setSavedAccounts(updated);
  }, [profile, user]);

  const refresh = useCallback(() => {
    setSavedAccounts(getSavedAccounts());
  }, []);

  const saveCurrentAccount = useCallback(
    (profileData) => {
      const data = profileData || profile;
      if (!data?.uid) return;
      const provider = getPrimaryProvider(user);
      const updated = saveAccount({
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        avatar: data.avatar,
        role: data.role,
        provider,
      });
      setSavedAccounts(updated);
    },
    [profile, user],
  );

  const removeAccount = useCallback((uid) => {
    const updated = removeSavedAccount(uid);
    setSavedAccounts(updated);
    return updated;
  }, []);

  /**
   * Signs out the current Firebase user (if any), then navigates to the login
   * page with the target account's email pre-filled.
   */
  const navigateToLogin = useCallback(
    async (account) => {
      const email = account?.email || "";
      const loginUrl = `/login${email ? `?email=${encodeURIComponent(email)}` : ""}`;

      if (auth.currentUser) {
        await signOut(auth);
      }

      navigate(loginUrl, { replace: true });
    },
    [navigate],
  );

  /**
   * Signs out and authenticates with a passkey.
   * After successful passkey auth, Firebase Auth state updates automatically
   * via signInWithCustomToken, and AuthContext picks up the new user.
   *
   * Returns { success, uid?, error? }
   */
  const switchWithPasskey = useCallback(
    async (account) => {
      if (!account?.email) {
        return { success: false, error: "no-email" };
      }

      // Sign out current user first
      if (auth.currentUser) {
        await signOut(auth);
      }

      try {
        const result = await authenticateWithPasskey(account.email);

        if (!result?.customToken) {
          return { success: false, error: "no-token" };
        }

        await signInWithCustomToken(auth, result.customToken);

        // Check for account mismatch:
        // The passkey may belong to a different account than selected.
        // AuthContext will update with the actual authenticated UID.
        // We return success — the caller can verify the UID matches if needed.
        return { success: true, uid: auth.currentUser?.uid };
      } catch (error) {
        // User cancelled or authentication failed
        if (error.name === "NotAllowedError") {
          return { success: false, error: "cancelled" };
        }
        return { success: false, error: error.message || "passkey-failed" };
      }
    },
    [],
  );

  /**
   * Hybrid account switching:
   * - For social accounts (Google/Facebook): signs out, then opens social auth tab
   * - For passkey accounts: signs out, then authenticates with passkey
   * - For email/password accounts: signs out, then navigates to login with email pre-filled
   *
   * Throws on signOut failure so the caller can handle the error.
   */
  const switchToAccount = useCallback(
    async (account) => {
      if (!account?.uid) return;

      const isSocialAccount =
        account.provider === "google.com" || account.provider === "facebook.com";

      const hasPasskey = account.hasPasskey === true;

      // Sign out current user first
      if (auth.currentUser) {
        await signOut(auth);
      }

      if (isSocialAccount) {
        const method = account.provider === "google.com" ? "google" : "facebook";
        await signInWithProvider(method, { loginHint: account.email });
      } else if (hasPasskey) {
        // For accounts with passkeys, try passkey authentication
        try {
          const result = await authenticateWithPasskey(account.email);

          if (result?.customToken) {
            await signInWithCustomToken(auth, result.customToken);
          } else {
            // Fallback to login page if passkey auth fails
            const email = account.email || "";
            const loginUrl = `/login${email ? `?email=${encodeURIComponent(email)}` : ""}`;
            navigate(loginUrl, { replace: true });
          }
        } catch {
          // Fallback to login page on any error
          const email = account.email || "";
          const loginUrl = `/login${email ? `?email=${encodeURIComponent(email)}` : ""}`;
          navigate(loginUrl, { replace: true });
        }
      } else {
        // For email/password accounts, navigate to login with email pre-filled
        const email = account.email || "";
        const loginUrl = `/login${email ? `?email=${encodeURIComponent(email)}` : ""}`;
        navigate(loginUrl, { replace: true });
      }
    },
    [navigate],
  );

  return {
    savedAccounts,
    currentAccount: savedAccounts.find((a) => a.uid === profile?.uid) || null,
    otherAccounts: savedAccounts.filter((a) => a.uid !== profile?.uid),
    saveCurrentAccount,
    removeAccount,
    navigateToLogin,
    switchToAccount,
    switchWithPasskey,
    refresh,
  };
}
