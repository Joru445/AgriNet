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

/**
 * Manages the full FCM push notification lifecycle:
 *   1. Detect browser support
 *   2. Register FCM service worker (when user is logged in)
 *   3. Check permission status (does NOT auto-prompt)
 *   4. Request permission + get token (only on user gesture)
 *   5. Register installation with backend
 *   6. Handle cleanup on logout
 *
 * Does NOT automatically request permission on mount.
 * The consumer must call `requestPermission()` from a user gesture.
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

  // Check support on mount
  useEffect(() => {
    const pushSupported = isPushSupported();
    setSupported(pushSupported);
    setPermission(getNotificationPermission());
    setLoading(false);
  }, []);

  // When user is logged in and supported, register the FCM SW
  // and check if we already have a valid token
  useEffect(() => {
    if (!profile?.uid || !supported) return;

    let cancelled = false;

    async function initFCM() {
      try {
        // Register the FCM service worker
        const reg = await registerMessagingSW();
        if (cancelled) return;

        registrationRef.current = reg;
        installationIdRef.current = getInstallationId();

        // If permission is already granted, try to get existing token
        if (Notification.permission === "granted") {
          const token = await getFCMToken(reg);
          if (cancelled) return;

          if (token) {
            fcmTokenRef.current = token;

            // Re-register with backend to sync token (handles rotation)
            if (profile?.uid) {
              try {
                await registerPushInstallation({
                  fcmToken: token,
                  installationId: installationIdRef.current || getInstallationId(),
                });
              } catch (err) {
                console.error("[Push] Failed to re-register installation:", err);
              }
            }

            setSubscribed(true);
          }
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
   * 2. If granted, register FCM SW and get token
   * 3. Register installation with backend
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

    // Register installation with backend before considering push enabled
    if (profile?.uid) {
      try {
        await registerPushInstallation({
          fcmToken: token,
          installationId: installationIdRef.current || getInstallationId(),
        });
      } catch (err) {
        console.error("[Push] Failed to register installation:", err);
        fcmTokenRef.current = null;
        return false;
      }
    }

    setSubscribed(true);
    return true;
  }, [supported, profile?.uid]);

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
    // Re-check if we still have a valid token
    setSubscribed(Boolean(fcmTokenRef.current));
  }, []);

  // Clean up on logout
  useEffect(() => {
    if (profile !== null || !supported) return;

    // User logged out — clear local state
    fcmTokenRef.current = null;
    installationIdRef.current = null;
    setSubscribed(false);
  }, [profile, supported]);

  return {
    supported,
    permission,
    subscribed,
    loading,
    requestPermission,
    unsubscribe,
    refreshStatus,
  };
}
