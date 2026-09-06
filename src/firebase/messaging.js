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
 * CRITICAL: On Android Chrome, push events are only delivered to the
 * SERVICE WORKER CONTROLLER — not just any "activated" SW. If Workbox
 * (vite-plugin-pwa) already registered a SW at scope "/" first, the FCM
 * SW may reach "activated" state but never become the controller, so
 * push events are silently dropped. This function waits for the
 * 'controllerchange' event, which fires only after the SW calls
 * self.clients.claim() and the browser promotes it to controller.
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

    // Already the controller — nothing to wait for
    const currentController = navigator.serviceWorker.controller;
    if (currentController?.scriptURL?.endsWith(swPath)) {
      console.log("[FCM] Service worker is already the controller");
      return registration;
    }

    // SW is active but NOT the controller — wait for clients.claim()
    if (registration.active && !registration.waiting && !registration.installing) {
      console.log(
        "[FCM] Service worker is active but not the controller — waiting for claim",
      );

      await waitForControllerChange();
      console.log("[FCM] Service worker is now the controller");
      return registration;
    }

    // SW is installing or waiting — send SKIP_WAITING, then wait for
    // both activation AND controller change.
    const sw = registration.installing || registration.waiting;
    if (sw) {
      // Race check: may have activated between register() and here
      if (sw.state === "activated") {
        // Activated but may not be controller yet
        if (!currentController?.scriptURL?.endsWith(swPath)) {
          await waitForControllerChange();
        }
        console.log("[FCM] Service worker activated and is controller");
        return registration;
      }

      console.log(
        "[FCM] Service worker is",
        sw.state,
        "- activating and claiming clients",
      );

      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      // Wait for activation
      await new Promise((resolve) => {
        sw.addEventListener("statechange", (e) => {
          if (e.target.state === "activated") {
            resolve();
          }
        });
      });

      // Wait for the SW to become the controller (via clients.claim())
      await waitForControllerChange();

      console.log("[FCM] Service worker activated and is controller");
    }

    return registration;
  } catch (error) {
    console.error("[FCM] Service worker registration failed:", error);
    return null;
  }
}

/**
 * Wait for the 'controllerchange' event on navigator.serviceWorker.
 *
 * This event fires when a Service Worker calls self.clients.claim()
 * and the browser promotes it to the active controller. Without this,
 * push events are routed to the old controller (Workbox) and the FCM
 * SW never receives them.
 *
 * Includes a 3s safety timeout: if controllerchange never fires
 * (e.g., another SW already claimed), we resolve anyway so the
 * caller doesn't hang. The caller will proceed with getToken()
 * which may or may not work depending on whether the FCM SW
 * actually received the push subscription.
 */
function waitForControllerChange() {
  return new Promise((resolve) => {
    // If the FCM SW is already the controller, resolve immediately
    if (navigator.serviceWorker.controller?.scriptURL?.includes("firebase-messaging")) {
      resolve();
      return;
    }

    const onChange = () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onChange);
      clearTimeout(timeoutId);
      resolve();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onChange);

    // Safety timeout — don't block getToken() forever if claim() fails
    const timeoutId = setTimeout(() => {
      navigator.serviceWorker.removeEventListener("controllerchange", onChange);
      console.warn(
        "[FCM] controllerchange did not fire within 3s — " +
        "the FCM SW may not be the controller. Push delivery is not guaranteed."
      );
      resolve();
    }, 3000);
  });
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
