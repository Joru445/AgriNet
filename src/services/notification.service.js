import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { apiRequest } from "./api/api.client";

const notificationsRef = collection(db, "notifications");

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

  const q = query(
    notificationsRef,
    where("recipientId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(pageSize),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((notification) => ({
        id: notification.id,
        ...notification.data(),
      }));

      callback(notifications);
    },
    onError,
  );
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

  const q = query(
    notificationsRef,
    where("recipientId", "==", userId),
    where("read", "==", false),
    limit(UNREAD_COUNT_LIMIT),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.size);
    },
    onError,
  );
}

// ============================================================
// API WRAPPERS (one-time reads and mutations)
// ============================================================

export async function apiGetNotifications({ cursor = null, limit: pageSize = 20 } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (pageSize !== 20) params.set("limit", String(pageSize));

  const qs = params.toString();
  const endpoint = `/notifications${qs ? `?${qs}` : ""}`;

  const result = await apiRequest(endpoint);

  return {
    notifications: result.data,
    cursor: result.cursor,
    hasMore: result.hasMore,
  };
}

export async function apiMarkNotificationRead(notificationId) {
  if (!notificationId) return;

  await apiRequest(`/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: "PATCH",
  });
}

export async function apiMarkAllNotificationsRead() {
  await apiRequest("/notifications/read-all", {
    method: "PATCH",
  });
}
