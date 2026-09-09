import { getMessaging, getToken, deleteToken, onMessage } from "firebase/messaging";
import { app } from "./config";

/**
 * Firebase Cloud Messaging (FCM) module.
 *
 * Uses the existing Firebase app instance — no duplicate initialization.
 * The VAPID key is read from VITE_FIREBASE_VAPID_KEY in .env.local.
 *
 * This module provides:
 * - isMessagingSupported() — browser capability check
 * - requestFCMToken() — get an FCM registration token
 * - onForegroundMessage() — handle messages while app is open
 *
 * The FCM service worker (public/firebase-messaging-sw.js) handles
 * background push delivery. It is auto-registered by Firebase when
 * getToken() is called with a serviceWorkerRegistration.
 */

let messagingInstance = null;

/**
 * Lazily initialize Firebase Messaging.
 * Returns null if the browser doesn't support FCM.
 */
function getMessagingInstance() {
  if (messagingInstance) return messagingInstance;

  try {
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch {
    return null;
  }
}

/**
 * Check if Firebase Cloud Messaging is supported in this browser.
 * FCM requires Service Worker support, Push Manager, and Notifications.
 */
export function isMessagingSupported() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Get the current notification permission state.
 * Returns: "granted" | "denied" | "default"
 */
export function getPermissionState() {
  if (!("Notification" in window)) return "denied";
  return Notification.permission;
}

/**
 * Register the Firebase Messaging service worker.
 *
 * Firefox/Chrome allow only ONE service worker registration per
 * (origin, scope). The PWA's Workbox SW occupies scope "/" — if the FCM
 * SW also registered at scope "/", the later register() call REPLACES the
 * script in that slot, and push events then go to whichever script owns
 * the "/" registration (often Workbox, which has no push handler) and are
 * silently dropped.
 *
 * To avoid that conflict this registers the FCM SW at its own sub-scope
 * "/fcm-notifications/". The script lives at the origin root where the
 * max scope is "/", so any sub-scope prefix is allowed without a
 * Service-Worker-Allowed header.
 *
 * Push events are delivered to the ACTIVE service worker of the
 * registration that owns the push subscription — NOT to the page
 * controller. So this only needs to wait for the SW to activate; there is
 * no need to wait for controllerchange or clients.claim().
 *
 * @param {string} swPath - Path to the FCM service worker file
 * @param {string} scope - Registration scope (must be within the SW script's max scope)
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export async function registerMessagingSW(
  swPath = "/firebase-messaging-sw.js",
  scope = "/fcm-notifications/",
) {
  if (!("serviceWorker" in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register(swPath, {
      scope,
    });

    // If a newer SW version is waiting, invite it to activate immediately.
    // Safe no-op when there is no waiting/installing worker.
    const pending = registration.waiting || registration.installing;
    if (pending && pending.state === "waiting") {
      pending.postMessage({ type: "SKIP_WAITING" });
    }

    // Just wait for the SW to become active — delivery does not depend
    // on page-controller state.
    await waitForActive(registration);

    return registration;
  } catch (error) {
    console.error("[FCM] Service worker registration failed:", error);
    return null;
  }
}

/**
 * Wait for the registration's service worker to reach the "activated"
 * state. Resolves immediately if an active worker already exists.
 *
 * @param {ServiceWorkerRegistration} registration
 * @param {number} timeoutMs
 * @returns {Promise<void>}
 */
function waitForActive(registration, timeoutMs = 5000) {
  return new Promise((resolve) => {
    if (registration.active) {
      resolve();
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve();
    };

    const onStateChange = () => {
      if (registration.active) finish();
    };

    const onUpdateFound = () => {
      registration.installing?.addEventListener("statechange", onStateChange);
      registration.waiting?.addEventListener("statechange", onStateChange);
    };

    registration.installing?.addEventListener("statechange", onStateChange);
    registration.waiting?.addEventListener("statechange", onStateChange);
    registration.addEventListener("updatefound", onUpdateFound);

    const timer = setTimeout(() => {
      registration.removeEventListener("updatefound", onUpdateFound);
      console.warn(
        "[FCM] Service worker did not become active within",
        timeoutMs,
        "ms",
      );
      finish();
    }, timeoutMs);
  });
}

/**
 * Request an FCM registration token.
 *
 * This will:
 * 1. Register the FCM service worker (if not already registered)
 * 2. Ensure notification permission is granted
 * 3. Get an FCM token from Firebase (bounded by a 15s timeout so the
 *    toggle never hangs on a slow service worker or network)
 *
 * Does NOT auto-prompt for permission — the caller must ensure
 * this is invoked from a user gesture when permission is "default".
 *
 * @param {ServiceWorkerRegistration} [registration] - Pre-registered SW (optional)
 * @returns {Promise<string|null>} FCM token, or null on failure
 */
export async function requestFCMToken(registration) {
  const messaging = getMessagingInstance();
  if (!messaging) {
    console.warn("[FCM] Messaging not supported in this browser.");
    return null;
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || null;
  if (!vapidKey) {
    console.warn(
      "[FCM] No VAPID key configured. Set VITE_FIREBASE_VAPID_KEY in .env.local",
    );
    return null;
  }

  try {
    // Ensure we have a service worker registration
    if (!registration) {
      registration = await registerMessagingSW();
    }
    if (!registration) return null;

    const token = await Promise.race([
      getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      }),
      new Promise((_, reject) =>
        setTimeout(() => {
          const err = new Error("getToken timed out");
          err.code = "messaging/get-token-timeout";
          err.name = "FirebaseError";
          reject(err);
        }, 15000),
      ),
    ]);

    return token;
  } catch (error) {
    // Permission denied is expected — don't log as error
    if (error.code === "messaging/permission-blocked") {
      console.info("[FCM] Notification permission denied by user.");
    } else {
      console.error("[FCM] Failed to get token:", error);
    }
    return null;
  }
}

/**
 * Revoke an FCM token and unsubscribe the browser push subscription.
 *
 * This performs a clean unsubscribe: Firebase's deleteToken revokes
 * the token server-side, then pushManager.unsubscribe() removes the
 * browser subscription. Both are best-effort — partial cleanup is
 * acceptable because a new token will be issued on next subscribe.
 *
 * @param {string} token - The FCM registration token to revoke
 * @param {ServiceWorkerRegistration} registration - The SW registration
 * @returns {Promise<boolean>} Whether the operation succeeded (best-effort)
 */
export async function deleteFCMToken(token, registration) {
  const messaging = getMessagingInstance();
  let ok = false;

  if (messaging && token) {
    try {
      await deleteToken(messaging);
      ok = true;
    } catch {
      // Token may already be invalid — proceed to unsubscribe
    }
  }

  try {
    const subscription = await registration?.pushManager?.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      ok = true;
    }
  } catch {
    // Best-effort
  }

  return ok;
}

/**
 * Subscribe to foreground FCM messages.
 *
 * Call this when the app is open and you want to handle incoming
 * push messages in JavaScript (e.g., show a toast, update state).
 *
 * The existing Firestore notification listener remains the source
 * of truth for the notification UI. FCM foreground messages can
 * be used for supplemental real-time signaling.
 *
 * @param {function} callback - Called with the message payload
 * @returns {function} Unsubscribe function
 */
export function onForegroundMessage(callback) {
  const messaging = getMessagingInstance();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    callback(payload);
  });
}
