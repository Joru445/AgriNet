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
 * Manages the full FCM push notification lifecycle:
 *   1. Detect browser support
 *   2. Register FCM service worker (when user is logged in)
 *   3. Check permission status — set subscribed immediately if already granted
 *   4. Request permission + get token (only on user gesture)
 *   5. Register installation with backend (best-effort, does not block toggle)
 *   6. Handle cleanup on logout
 *   7. One-time permission prompt on first login
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
  useEffect(() => {
    if (!profile?.uid || !supported) return;

    let cancelled = false;

    async function initFCM() {
      try {
        const reg = await registerMessagingSW();
        if (cancelled) return;

        registrationRef.current = reg;
        installationIdRef.current = getInstallationId();

        if (Notification.permission === "granted") {
          const token = await getFCMToken(reg);
          if (cancelled) return;

          if (token) {
            fcmTokenRef.current = token;

            // Toggle reflects client-side state: we have a valid token.
            // Backend registration is best-effort — does not block the toggle.
            setSubscribed(true);
            setPermission(getNotificationPermission());

            if (profile?.uid && !registeredRef.current) {
              registerPushInstallation({
                fcmToken: token,
                installationId: installationIdRef.current || getInstallationId(),
              })
                .then(() => {
                  registeredRef.current = true;
                })
                .catch((err) => {
                  console.warn("[Push] Backend registration failed (will retry next load):", err);
                });
            }
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

    return () => {
      cancelled = true;
    };
  }, [profile?.uid, supported]);

  /**
   * Request permission and subscribe. Must be called from a user gesture.
   *
   * Flow:
   * 1. Request browser notification permission
   * 2. If granted, get FCM token
   * 3. Set subscribed immediately (toggle shows ON)
   * 4. Register installation with backend (best-effort)
   */
  const requestPermission = useCallback(async () => {
    if (!supported) return false;

    const result = await requestNotificationPermission();
    setPermission(result);

    if (result !== "granted") return false;

    // Get FCM token (registers SW if needed)
    const reg = registrationRef.current;
    const token = await getFCMToken(reg);
    if (!token) return false;

    fcmTokenRef.current = token;

    // Toggle reflects client-side success immediately
    setSubscribed(true);

    // Backend registration is best-effort — does not block the toggle
    if (profile?.uid) {
      registerPushInstallation({
        fcmToken: token,
        installationId: installationIdRef.current || getInstallationId(),
      })
        .then(() => {
          registeredRef.current = true;
        })
        .catch((err) => {
          console.warn("[Push] Backend registration failed (will retry next load):", err);
        });
    }

    return true;
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

    return requestPermission();
  }, [supported, profile?.uid, requestPermission]);

  /**
   * Unsubscribe from push notifications.
   */
  const unsubscribe = useCallback(async () => {
    const installationId = installationIdRef.current;

    // Remove from backend
    if (installationId) {
      try {
        await removePushInstallation(installationId);
      } catch (err) {
        console.error("[Push] Failed to remove installation:", err);
      }
    }

    fcmTokenRef.current = null;
    setSubscribed(false);
  }, []);

  /**
   * Check and update subscription status.
   * Useful after focus regain or tab switch.
   */
  const refreshStatus = useCallback(() => {
    setPermission(getNotificationPermission());
    setSubscribed(Boolean(fcmTokenRef.current));
  }, []);

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
