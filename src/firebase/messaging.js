import { getMessaging, getToken, onMessage } from "firebase/messaging";
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
 * Firebase needs a ServiceWorkerRegistration to deliver push messages.
 * This registers firebase-messaging-sw.js which handles background delivery.
 *
 * CRITICAL: On Android Chrome, push events are only delivered to ACTIVE
 * service workers. If another SW (e.g. Workbox) already controls the
 * scope, the FCM SW enters "waiting" state and push events are dropped.
 * This function ensures the FCM SW is activated before returning.
 *
 * @param {string} swPath - Path to the FCM service worker file
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export async function registerMessagingSW(
  swPath = "/firebase-messaging-sw.js",
) {
  if (!("serviceWorker" in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register(swPath, {
      scope: "/",
    });

    // Already active — nothing to wait for
    if (registration.active) {
      console.log("[FCM] Service worker registered and active:", registration.scope);
      return registration;
    }

    // SW is installing or waiting — Android Chrome requires it to be
    // active before push events will be delivered.
    const sw = registration.installing || registration.waiting;
    if (sw) {
      // Race check: may have activated between register() and here
      if (sw.state === "activated") {
        console.log("[FCM] Service worker already activated:", registration.scope);
        return registration;
      }

      console.log(
        "[FCM] Service worker is",
        sw.state,
        "- waiting for activation before getToken()",
      );

      // Tell a waiting SW to skip the queue
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      await new Promise((resolve) => {
        sw.addEventListener("statechange", (e) => {
          if (e.target.state === "activated") {
            resolve();
          }
        });
      });

      console.log("[FCM] Service worker activated:", registration.scope);
    }

    return registration;
  } catch (error) {
    console.error("[FCM] Service worker registration failed:", error);
    return null;
  }
}

/**
 * Request an FCM registration token.
 *
 * This will:
 * 1. Register the FCM service worker (if not already registered)
 * 2. Request notification permission (only if not already granted/denied)
 * 3. Get an FCM token from Firebase
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

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

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
