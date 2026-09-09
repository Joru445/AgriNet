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
  hasMadePushChoice,
  markPushChoice,
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
 * Safe token preview for logs — never expose a full FCM token.
 */
function maskToken(token) {
  if (!token || token.length < 12) return "[token]";
  return `${token.slice(0, 8)}...${token.slice(-4)}`;
}

/**
 * Manages the full FCM push notification lifecycle.
 *
 * State is driven by an explicit per-user opt-in flag (`hasOptedIn`).
 * Toggle ON = browser permission granted AND backend registration confirmed.
 * Toggle OFF = opt-in cleared AND browser subscription removed.
 *
 * Key behaviors:
 * 1. Detect browser support; surface an `initializing` state so the toggle
 *    never renders a wrong OFF during the SW/token round-trip on cold start.
 * 2. Fast path: if an opted-in user already has a live browser subscription
 *    on mount, reflect ON immediately, then reconcile the token + backend
 *    registration in the background.
 * 3. One-time adoption only for pre-existing subscribers who NEVER made an
 *    explicit choice (legacy state). An OFF the user explicitly chose is
 *    never resurrected.
 * 4. Request permission + get token + await backend registration (toggle
 *    only shows ON after backend confirms) — driven by user gesture.
 * 5. Cleanup on logout.
 * 6. Re-init on `agrinet:push-opted-in` event (e.g., onboarding grant).
 *
 * All getToken/SW calls are bounded by timeouts so the toggle never hangs.
 */
export default function usePushNotifications() {
  const { profile } = useAuth();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [subscribed, setSubscribed] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const registrationRef = useRef(null);
  const registrationPromiseRef = useRef(null);
  const fcmTokenRef = useRef(null);
  const installationIdRef = useRef(null);
  const registeredRef = useRef(false);

  // Check support on mount — synchronously determine initial state
  useEffect(() => {
    const pushSupported = isPushSupported();
    setSupported(pushSupported);
    setPermission(getNotificationPermission());
    if (!pushSupported) setInitializing(false);
  }, []);

  /**
   * Shared SW registration promise. Concurrent callers reuse the same
   * in-flight registration instead of racing register()/getToken() calls.
   */
  const ensureRegistration = useCallback(() => {
    if (registrationRef.current) return Promise.resolve(registrationRef.current);
    if (!registrationPromiseRef.current) {
      registrationPromiseRef.current = registerMessagingSW()
        .then((registration) => {
          if (!registration) {
            registrationPromiseRef.current = null;
            setInitializing(false);
            return null;
          }
          registrationRef.current = registration;
          return registration;
        })
        .catch(() => {
          registrationPromiseRef.current = null;
          setInitializing(false);
          return null;
        });
    }
    return registrationPromiseRef.current;
  }, []);

  /**
   * Full subscribe flow: get token + await backend installation + set ON.
   * Strict: ON is only shown when the backend confirms the installation.
   *
   * @param {ServiceWorkerRegistration} registration
   * @param {boolean} markChoice - record an explicit user choice (user gesture paths)
   */
  const performSubscribe = useCallback(
    async (registration, { markChoice = false } = {}) => {
      const token = await getFCMToken(registration);
      if (!token) {
        fcmTokenRef.current = null;
        setSubscribed(false);
        return { ok: false, reason: "token" };
      }

      fcmTokenRef.current = token;

      if (profile?.uid && !registeredRef.current) {
        try {
          await registerPushInstallation({
            fcmToken: token,
            installationId: installationIdRef.current || getInstallationId(),
          });
          registeredRef.current = true;
        } catch (err) {
          console.error("[Push] Backend installation registration failed:", err);
          registeredRef.current = false;
          setSubscribed(false);
          return { ok: false, reason: "backend" };
        }
      }

      if (profile?.uid) {
        markOptedIn(profile.uid);
        if (markChoice) markPushChoice(profile.uid);
      }
      setSubscribed(true);
      return { ok: true };
    },
    [profile?.uid],
  );

  // When user is logged in and supported, register the FCM SW and
  // detect/patch up existing subscription state.
  useEffect(() => {
    if (!profile?.uid || !supported) {
      setInitializing(false);
      return;
    }

    let cancelled = false;
    const uid = profile.uid;

    async function initFCM() {
      setInitializing(true);
      try {
        const reg = await ensureRegistration();
        if (cancelled || !reg) return;

        registrationRef.current = reg;
        installationIdRef.current = getInstallationId();

        const permissionState = getNotificationPermission();
        setPermission(permissionState);

        if (permissionState === "granted") {
          const liveSub = await reg.pushManager.getSubscription().catch(() => null);
          if (cancelled) return;

          // One-time adoption: legacy subscribers who never made an explicit
          // choice but already have a granted permission + live subscription.
          if (liveSub && !hasOptedIn(uid) && !hasMadePushChoice(uid)) {
            markOptedIn(uid);
          }

          if (hasOptedIn(uid)) {
            // Fast path: reflect a live subscription ON immediately, before
            // the token + backend reconcile resolves. Prevents the toggle
            // from showing OFF during the SW/token round-trip on cold start.
            if (liveSub) setSubscribed(true);

            const outcome = await performSubscribe(reg, { markChoice: false });
            if (cancelled) return;

            console.log(
              "[Push] Cold-start reconcile:",
              outcome.ok ? "on" : outcome.reason,
              maskToken(fcmTokenRef.current),
            );

            if (!outcome.ok) setSubscribed(false);
          } else {
            setSubscribed(false);
          }
        } else {
          setSubscribed(false);
        }
      } catch (err) {
        console.error("[Push] Error initializing FCM:", err);
        setSubscribed(false);
      } finally {
        if (!cancelled) setInitializing(false);
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
  }, [profile?.uid, supported, ensureRegistration, performSubscribe]);

  /**
   * Request permission and subscribe. Must be called from a user gesture.
   *
   * Flow:
   * 1. Request browser notification permission
   * 2. If granted, get FCM token (bounded by timeout)
   * 3. Register installation with backend (awaited — strict)
   * 4. Mark opt-in + explicit choice and set subscribed on success
   *
   * @returns {{ ok: boolean, reason?: string }}
   */
  const requestPermission = useCallback(async () => {
    if (!supported) return { ok: false, reason: "unsupported" };
    if (busyRef.current) return { ok: false, reason: "busy" };

    busyRef.current = true;
    setBusy(true);
    try {
      const result = await requestNotificationPermission();
      setPermission(result);

      if (result !== "granted") return { ok: false, reason: "permission" };

      const reg = await ensureRegistration();
      if (!reg) return { ok: false, reason: "token" };

      return await performSubscribe(reg, { markChoice: true });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [supported, ensureRegistration, performSubscribe]);

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
   * Removes browser subscription, revokes FCM token, clears opt-in flag,
   * and records that the user made an explicit choice (so adoption never
   * resurrects this OFF). OFF is persistent across reloads.
   */
  const unsubscribe = useCallback(async () => {
    if (busyRef.current) return { ok: false };

    busyRef.current = true;
    setBusy(true);
    const uid = profile?.uid;
    try {
      const installationId = installationIdRef.current || getInstallationId();
      const token = fcmTokenRef.current;
      const reg = registrationRef.current || (await ensureRegistration());

      try {
        await deleteFCMToken(token, reg);
      } catch {
        // Best-effort — partial cleanup is acceptable
      }

      if (installationId) {
        try {
          await removePushInstallation(installationId);
        } catch (err) {
          console.error("[Push] Failed to remove installation:", err);
        }
      }

      if (uid) {
        markPushChoice(uid);
        clearOptIn(uid);
      }

      fcmTokenRef.current = null;
      registeredRef.current = false;
      setSubscribed(false);
      return { ok: true };
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [profile?.uid, ensureRegistration]);

  /**
   * Check and update subscription status without the token round-trip.
   * Useful after focus regain or tab switch.
   */
  const refreshStatus = useCallback(async () => {
    const permissionState = getNotificationPermission();
    setPermission(permissionState);

    const uid = profile?.uid;
    if (uid && permissionState === "granted" && hasOptedIn(uid)) {
      const reg = registrationRef.current || (await ensureRegistration());
      const liveSub = await reg?.pushManager?.getSubscription().catch(() => null);
      setSubscribed(Boolean(liveSub));
    } else {
      setSubscribed(false);
    }
  }, [profile?.uid, ensureRegistration]);

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
    initializing,
    busy,
    requestPermission,
    promptOnFirstLogin,
    unsubscribe,
    refreshStatus,
  };
}