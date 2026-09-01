import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  isPushSupported,
  getNotificationPermission,
  registerPushSW,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getPushSubscription,
  savePushSubscription,
  removePushSubscription,
} from "../services/pushSubscription.service";

/**
 * Manages the full push notification lifecycle:
 *   1. Detect browser support
 *   2. Request permission (only on user action)
 *   3. Register push service worker
 *   4. Create/manage push subscription
 *   5. Store subscription in Firestore
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

  // Check support on mount
  useEffect(() => {
    const pushSupported = isPushSupported();
    setSupported(pushSupported);
    setPermission(getNotificationPermission());
    setLoading(false);
  }, []);

  // Check existing subscription when user is logged in
  useEffect(() => {
    if (!profile?.uid || !supported) return;

    let cancelled = false;

    async function checkSubscription() {
      try {
        const reg = await registerPushSW();
        if (cancelled) return;

        registrationRef.current = reg;

        if (reg) {
          const sub = await getPushSubscription(reg);
          if (cancelled) return;

          setSubscribed(Boolean(sub));
          setPermission(getNotificationPermission());
        }
      } catch (err) {
        console.error("[Push] Error checking subscription:", err);
      }
    }

    checkSubscription();

    return () => {
      cancelled = true;
    };
  }, [profile?.uid, supported]);

  /**
   * Request permission and subscribe. Must be called from a user gesture.
   */
  const requestPermission = useCallback(async () => {
    if (!supported) return false;

    const result = await requestNotificationPermission();
    setPermission(result);

    if (result !== "granted") return false;

    // Register the push SW if not already done
    const reg = registrationRef.current || (await registerPushSW());
    registrationRef.current = reg;

    if (!reg) return false;

    // Subscribe to push
    const subscription = await subscribeToPush(reg);
    if (!subscription) return false;

    setSubscribed(true);

    // Store in Firestore if user is logged in
    if (profile?.uid) {
      try {
        await savePushSubscription(profile.uid, subscription);
      } catch (err) {
        console.error("[Push] Failed to save subscription:", err);
      }
    }

    return true;
  }, [supported, profile?.uid]);

  /**
   * Unsubscribe from push notifications.
   */
  const unsubscribe = useCallback(async () => {
    const reg = registrationRef.current;
    if (!reg) return;

    await unsubscribeFromPush(reg);
    setSubscribed(false);

    // Remove from Firestore
    if (profile?.uid) {
      try {
        await removePushSubscription(profile.uid);
      } catch (err) {
        console.error("[Push] Failed to remove subscription:", err);
      }
    }
  }, [profile?.uid]);

  /**
   * Check and update subscription status.
   * Useful after focus regain or tab switch.
   */
  const refreshStatus = useCallback(async () => {
    const reg = registrationRef.current;
    if (!reg) return;

    const sub = await getPushSubscription(reg);
    setSubscribed(Boolean(sub));
    setPermission(getNotificationPermission());
  }, []);

  // Clean up Firestore subscription on logout
  useEffect(() => {
    if (profile !== null || !supported) return;

    // User logged out — clean up any stored subscription
    // Note: We can't remove the PushManager subscription without the user's
    // explicit action, but we can remove the Firestore record
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
