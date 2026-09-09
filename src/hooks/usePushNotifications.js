import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getFCMToken,
  registerMessagingSW,
  registerPushInstallation,
  removePushInstallation,
  getInstallationId,
  hasOptedIn,
  markOptedIn,
  clearOptIn,
  deleteFCMToken,
} from "../services/pushSubscription.service";

const PROMPT_DONE_KEY_PREFIX = "agrinet_push_prompted_v2_";

function hasPromptedBefore(uid) {
  if (!uid) return true;
  try {
    return localStorage.getItem(PROMPT_DONE_KEY_PREFIX + uid) === "1";
  } catch {
    return true;
  }
}

function markPromptedDone(uid) {
  if (!uid) return;
  try {
    localStorage.setItem(PROMPT_DONE_KEY_PREFIX + uid, "1");
  } catch {
    // Storage unavailable; prompt will show again next session.
  }
}

/**
 * Manages the full FCM push notification lifecycle.
 *
 * State is driven by an explicit per-user opt-in flag (`hasOptedIn`).
 * Toggle ON = browser permission granted AND backend registration confirmed.
 * Toggle OFF = browser subscription actually removed (persists across reloads).
 *
 * 1. Detect browser support
 * 2. Register FCM service worker (when user is logged in)
 * 3. One-time adoption for pre-existing subscribers (permission granted + live subscription)
 * 4. Request permission + get token + await backend registration (only on user gesture)
 * 5. Handle cleanup on logout
 * 6. Re-init on `agrinet:push-opted-in` event (e.g., onboarding grant)
 */
export default function usePushNotifications() {
  const { profile } = useAuth();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const registrationRef = useRef(null);
  const fcmTokenRef = useRef(null);
  const installationIdRef = useRef(null);
  const registeredRef = useRef(false);

  // Check support on mount — synchronously determine initial state
  useEffect(() => {
    const pushSupported = isPushSupported();
    setSupported(pushSupported);
    setPermission(getNotificationPermission());
    setLoading(false);
  }, []);

  // When user is logged in and supported, register the FCM SW
  // and detect existing subscription state immediately.
  // Only subscribes when the user has explicitly opted in.
  useEffect(() => {
    if (!profile?.uid || !supported) return;

    let cancelled = false;
    const uid = profile.uid;

    async function initFCM() {
      try {
        const reg = await registerMessagingSW();
        if (cancelled) return;

        registrationRef.current = reg;
        installationIdRef.current = getInstallationId();

        if (Notification.permission === "granted") {
          // One-time adoption: pre-existing subscribers who never had an
          // opt-in flag (granted via browser settings or old onboarding)
          if (!hasOptedIn(uid)) {
            const existing = await reg.pushManager
              .getSubscription()
              .catch(() => null);
            if (existing) markOptedIn(uid);
          }

          // Not opted in — do NOT auto-subscribe. Toggle stays OFF.
          if (!hasOptedIn(uid)) {
            setSubscribed(false);
            setPermission(getNotificationPermission());
            return;
          }

          // Opted in — full flow: token + backend registration
          const token = await getFCMToken(reg);
          if (cancelled) return;

          if (token) {
            fcmTokenRef.current = token;

            // Await backend registration (strict — toggle reflects reality)
            if (profile?.uid && !registeredRef.current) {
              await registerPushInstallation({
                fcmToken: token,
                installationId: installationIdRef.current || getInstallationId(),
              }).catch(() => {});
              registeredRef.current = true;
            }

            setSubscribed(true);
          } else {
            setSubscribed(false);
          }
        } else {
          setSubscribed(false);
        }

        setPermission(getNotificationPermission());
      } catch (err) {
        console.error("[Push] Error initializing FCM:", err);
      }
    }

    initFCM();

    // Re-init when onboarding grants permission and sets opt-in
    const handleOptedIn = () => initFCM();
    window.addEventListener("agrinet:push-opted-in", handleOptedIn);

    return () => {
      cancelled = true;
      window.removeEventListener("agrinet:push-opted-in", handleOptedIn);
    };
  }, [profile?.uid, supported]);

  /**
   * Request permission and subscribe. Must be called from a user gesture.
   *
   * Flow:
   * 1. Request browser notification permission
   * 2. If granted, get FCM token
   * 3. Register installation with backend (awaited — strict)
   * 4. Mark opt-in and set subscribed on success
   *
   * @returns {{ ok: boolean, reason?: string }}
   */
  const requestPermission = useCallback(async () => {
    if (!supported) return { ok: false, reason: "unsupported" };

    const result = await requestNotificationPermission();
    setPermission(result);

    if (result !== "granted") return { ok: false, reason: "permission" };

    // Get FCM token (registers SW if needed)
    const reg = registrationRef.current;
    const token = await getFCMToken(reg);
    if (!token) return { ok: false, reason: "token" };

    fcmTokenRef.current = token;

    // Backend registration — await it (toggle only shows ON after confirmed)
    if (profile?.uid) {
      try {
        await registerPushInstallation({
          fcmToken: token,
          installationId: installationIdRef.current || getInstallationId(),
        });
        registeredRef.current = true;
      } catch {
        return { ok: false, reason: "backend" };
      }
    }

    // Opt-in persisted — toggle is now truthful and persistent
    markOptedIn(profile?.uid);
    setSubscribed(true);
    return { ok: true };
  }, [supported, profile?.uid]);

  /**
   * One-time notification permission prompt for first login.
   *
   * Checks localStorage to avoid re-prompting.
   * Must be called from a user gesture (e.g., after onboarding completes).
   *
   * @returns {Promise<string>} The resulting permission state
   */
  const promptOnFirstLogin = useCallback(async () => {
    if (!supported) return "denied";
    if (!profile?.uid) return "default";
    if (hasPromptedBefore(profile.uid)) return getNotificationPermission();

    markPromptedDone(profile.uid);

    // If permission already granted or denied, don't re-prompt
    const current = getNotificationPermission();
    if (current !== "default") return current;

    const result = await requestPermission();
    return result?.ok ? "granted" : "denied";
  }, [supported, profile?.uid, requestPermission]);

  /**
   * Unsubscribe from push notifications.
   * Removes browser subscription, revokes FCM token, clears opt-in flag.
   * OFF is persistent — does not re-resubscribe on reload.
   */
  const unsubscribe = useCallback(async () => {
    const uid = profile?.uid;
    const installationId = installationIdRef.current;
    const token = fcmTokenRef.current;
    const reg = registrationRef.current;

    // Remove browser subscription + revoke FCM token
    try {
      await deleteFCMToken(token, reg);
    } catch {
      // Best-effort — partial cleanup is acceptable
    }

    // Remove from backend
    if (installationId) {
      try {
        await removePushInstallation(installationId);
      } catch (err) {
        console.error("[Push] Failed to remove installation:", err);
      }
    }

    // Clear opt-in so OFF is persistent across reloads
    if (uid) clearOptIn(uid);

    fcmTokenRef.current = null;
    registeredRef.current = false;
    setSubscribed(false);
  }, [profile?.uid]);

  /**
   * Check and update subscription status.
   * Useful after focus regain or tab switch.
   */
  const refreshStatus = useCallback(() => {
    setPermission(getNotificationPermission());
    setSubscribed(hasOptedIn(profile?.uid) && Boolean(fcmTokenRef.current));
  }, [profile?.uid]);

  // Clean up on logout
  useEffect(() => {
    if (profile !== null || !supported) return;

    fcmTokenRef.current = null;
    installationIdRef.current = null;
    registeredRef.current = false;
    setSubscribed(false);
  }, [profile, supported]);

  return {
    supported,
    permission,
    subscribed,
    loading,
    requestPermission,
    promptOnFirstLogin,
    unsubscribe,
    refreshStatus,
  };
}
