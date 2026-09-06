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

// ============================================================
// REALTIME SUBSCRIBE (kept for live UI updates)
// ============================================================

export function subscribeUserNotifications(
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
    orderBy("createdAt", "desc"),
    limit(50),
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
