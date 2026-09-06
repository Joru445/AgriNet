import {
  isMessagingSupported,
  getPermissionState,
  registerMessagingSW,
  requestFCMToken,
} from "../firebase/messaging";
import { apiRequest } from "./api/api.client";

// Re-export for consumers that need direct SW registration
export { registerMessagingSW };

// ============================================================
// PUSH SUPPORT DETECTION
// ============================================================

/**
 * Check if push notifications are supported in this browser.
 */
export function isPushSupported() {
  return isMessagingSupported();
}

/**
 * Get the current notification permission state.
 * Returns: "granted" | "denied" | "default"
 */
export function getNotificationPermission() {
  return getPermissionState();
}

// ============================================================
// PERMISSION REQUEST
// ============================================================

/**
 * Request notification permission from the user.
 * Only call this from a user gesture (button click).
 * Returns the resulting permission state.
 */
export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "denied";

  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";

  const result = await Notification.requestPermission();
  return result;
}

// ============================================================
// FCM TOKEN MANAGEMENT
// ============================================================

/**
 * Register the FCM service worker and obtain an FCM token.
 *
 * Does NOT auto-request permission — the caller must ensure
 * permission is "granted" before calling, or handle the
 * permission prompt via requestNotificationPermission() first.
 *
 * @param {ServiceWorkerRegistration} [registration] - Pre-registered SW
 * @returns {Promise<string|null>} FCM token, or null on failure
 */
export async function getFCMToken(registration) {
  if (!registration) {
    registration = await registerMessagingSW();
  }
  if (!registration) return null;

  return requestFCMToken(registration);
}

// ============================================================
// INSTALLATION REGISTRATION (Backend API)
// ============================================================

/**
 * Register a push installation with the backend.
 *
 * POST /api/push/installations
 *
 * The backend associates the installation with req.user.uid.
 * The client does NOT send recipient/user IDs as authoritative identity.
 *
 * @param {object} params
 * @param {string} params.fcmToken - FCM registration token
 * @param {string} [params.installationId] - Client-generated installation identifier
 * @param {string} [params.platform] - "web" | "android" | "ios"
 * @param {string} [params.userAgent] - Browser user agent string
 */
export async function registerPushInstallation({
  fcmToken,
  installationId,
  platform = "web",
  userAgent,
} = {}) {
  if (!fcmToken) return null;

  const body = {
    fcmToken,
    installationId: installationId || getInstallationId(),
    platform,
    userAgent: userAgent || navigator.userAgent,
  };

  try {
    const result = await apiRequest("/push/installations", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return result;
  } catch (error) {
    // Backend endpoint may not exist yet — don't crash
    if (error.status === 404 || error.status === 501) {
      console.info(
        "[Push] Backend push installation endpoint not available yet.",
      );
      return null;
    }
    throw error;
  }
}

/**
 * Remove a push installation from the backend.
 *
 * DELETE /api/push/installations/:installationId
 *
 * @param {string} installationId
 */
export async function removePushInstallation(installationId) {
  if (!installationId) return;

  try {
    await apiRequest(`/push/installations/${encodeURIComponent(installationId)}`, {
      method: "DELETE",
    });
  } catch (error) {
    // Backend endpoint may not exist yet — don't crash
    if (error.status === 404 || error.status === 501) {
      return;
    }
    console.error("[Push] Failed to remove installation:", error);
  }
}

// ============================================================
// INSTALLATION IDENTIFICATION
// ============================================================

const INSTALLATION_ID_KEY = "agrinet_push_installation_id";

/**
 * Get or generate a stable installation identifier.
 * Stored in localStorage to persist across sessions.
 */
export function getInstallationId() {
  try {
    let id = localStorage.getItem(INSTALLATION_ID_KEY);
    if (id) return id;

    // Generate a new installation ID
    id = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    localStorage.setItem(INSTALLATION_ID_KEY, id);
    return id;
  } catch {
    // localStorage unavailable (private browsing, etc.)
    return `fallback-${Date.now()}`;
  }
}
