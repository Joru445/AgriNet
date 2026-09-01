import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firestore";

const PUSH_SW_SCOPE = "/push-sw.js";

/**
 * Convert a URL-safe base64 string to a Uint8Array for VAPID.
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Get the VAPID public key from environment.
 * In production, set VITE_VAPID_PUBLIC_KEY in your .env.local.
 */
function getVapidPublicKey() {
  return import.meta.env.VITE_VAPID_PUBLIC_KEY || null;
}

/**
 * Check if push notifications are supported in this browser.
 */
export function isPushSupported() {
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
export function getNotificationPermission() {
  if (!("Notification" in window)) return "denied";
  return Notification.permission;
}

/**
 * Register the push service worker (the lightweight one for push events).
 * The Workbox SW is registered separately by vite-plugin-pwa.
 */
export async function registerPushSW() {
  if (!("serviceWorker" in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register(PUSH_SW_SCOPE, {
      scope: "/",
    });
    console.log("[Push] Push SW registered:", registration.scope);
    return registration;
  } catch (error) {
    console.error("[Push] Push SW registration failed:", error);
    return null;
  }
}

/**
 * Request notification permission from the user.
 * Only call this from a user gesture (button click).
 * Returns the resulting permission state.
 */
export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "denied";

  // If already granted, no need to ask
  if (Notification.permission === "granted") return "granted";

  // If denied, we can't ask again (browser blocks it)
  if (Notification.permission === "denied") return "denied";

  const result = await Notification.requestPermission();
  return result;
}

/**
 * Subscribe to web push via the PushManager.
 * Requires the push SW to be registered and notification permission granted.
 *
 * @param {ServiceWorkerRegistration} registration - The push SW registration
 * @returns {PushSubscription | null}
 */
export async function subscribeToPush(registration) {
  const vapidPublicKey = getVapidPublicKey();
  if (!vapidPublicKey) {
    console.warn(
      "[Push] No VAPID public key configured. Set VITE_VAPID_PUBLIC_KEY in .env.local",
    );
    return null;
  }

  try {
    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    // If there's an existing subscription, check if it's still valid
    if (subscription) {
      // Check if the subscription's endpoint is still reachable
      // by checking the expiration time if available
      const expirationTime = subscription.expirationTime;
      if (expirationTime && expirationTime < Date.now()) {
        // Subscription expired, unsubscribe and create new one
        await subscription.unsubscribe();
        subscription = null;
      }
    }

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    return subscription;
  } catch (error) {
    console.error("[Push] Failed to subscribe to push:", error);
    return null;
  }
}

/**
 * Unsubscribe from web push.
 */
export async function unsubscribeFromPush(registration) {
  try {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }
  } catch (error) {
    console.error("[Push] Failed to unsubscribe from push:", error);
  }
}

/**
 * Get the current push subscription.
 */
export async function getPushSubscription(registration) {
  if (!registration) return null;
  try {
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

// ============================================================
// FIRESTORE SUBSCRIPTION STORAGE
// ============================================================

/**
 * Store the push subscription in Firestore under pushSubscriptions collection.
 * Document ID is the user's UID (one subscription per user).
 *
 * NOTE: Without a backend (Cloud Functions), this stored subscription
 * cannot automatically trigger push delivery. It serves as the foundation
 * for a future push sender service.
 */
export async function savePushSubscription(uid, subscription) {
  if (!uid || !subscription) return;

  const subscriptionData = subscription.toJSON();

  await setDoc(doc(db, "pushSubscriptions", uid), {
    uid,
    endpoint: subscriptionData.endpoint,
    keys: subscriptionData.keys,
    expirationTime: subscriptionData.expirationTime || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Remove the push subscription from Firestore.
 */
export async function removePushSubscription(uid) {
  if (!uid) return;
  try {
    await deleteDoc(doc(db, "pushSubscriptions", uid));
  } catch {
    // Document might not exist
  }
}
