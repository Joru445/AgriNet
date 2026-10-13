import { apiRequest } from "./api/api.client";
import { subscribeToRealtime } from "./api/realtime.client";

// Pagination batch size for the notification list.
export const NOTIFICATIONS_PAGE_SIZE = 6;

// Cap for the unread badge counter. Only unread docs are read, keeping this
// listener cheap while preserving accurate badge counts in real time.
// The Badge component already displays "99+" for counts above 99, so
// this limit only affects how many docs Firestore evaluates per snapshot.
const UNREAD_COUNT_LIMIT = 100;

// ============================================================
// PAGINATION CURSOR
// ============================================================

function encodeBase64Url(json) {
  const b64 = btoa(json);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Builds a pagination cursor from a notification using the same `{ ts, id }`
 * base64url format the backend expects for `GET /notifications?cursor=`.
 * Mirrors the backend's `startAfter(new Date(ts), id)` ordering.
 */
export function buildNotificationsCursor(notification) {
  if (!notification?.id || !notification.createdAt) return null;

  const createdAt = notification.createdAt;
  const ts =
    typeof createdAt.toMillis === "function"
      ? createdAt.toMillis()
      : typeof createdAt === "number" || typeof createdAt === "string"
        ? new Date(createdAt).getTime()
        : null;

  if (ts == null || Number.isNaN(ts)) return null;

  return encodeBase64Url(JSON.stringify({ ts, id: notification.id }));
}

// ============================================================
// REALTIME SUBSCRIBES (live UI updates)
// ============================================================

export function subscribeUserNotifications(
  userId,
  callback,
  onError,
  pageSize = NOTIFICATIONS_PAGE_SIZE,
) {
  if (!userId) {
    return () => {};
  }

  return subscribeToRealtime("/v1/notifications/stream", (items) => callback(items.slice(0, pageSize)), onError);
}

/**
 * Realtime listener scoped to unread notifications only. Used to keep the
 * badge counter accurate without loading the user's whole collection.
 * Firestore evaluates the provided callback with the current unread count.
 */
export function subscribeUnreadNotifications(
  userId,
  callback,
  onError,
) {
  if (!userId) {
    return () => {};
  }

  return subscribeToRealtime("/v1/notifications/stream", (items) => {
    callback(items.filter((item) => item.read === false).slice(0, UNREAD_COUNT_LIMIT).length);
  }, onError);
}

// ============================================================
// API WRAPPERS (one-time reads and mutations)
// ============================================================

export async function apiGetNotifications({ cursor = null, limit: pageSize = 20 } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (pageSize !== 20) params.set("limit", String(pageSize));

  const qs = params.toString();
  const endpoint = `/v1/notifications${qs ? `?${qs}` : ""}`;

  const result = await apiRequest(endpoint);

  return {
    notifications: result.data,
    cursor: result.cursor,
    hasMore: result.hasMore,
  };
}

export async function apiMarkNotificationRead(notificationId) {
  if (!notificationId) return;

  await apiRequest(`/v1/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: "PATCH",
  });
}

export async function apiMarkAllNotificationsRead() {
  await apiRequest("/v1/notifications/read-all", {
    method: "PATCH",
  });
}
