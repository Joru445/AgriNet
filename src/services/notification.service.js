import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

const notificationsRef = collection(db, "notifications");

export async function createNotification(notification) {
  if (!notification?.recipientId) {
    throw new Error("Notification recipient is required.");
  }

  return addDoc(notificationsRef, {
    recipientId: notification.recipientId,

    type: notification.type || "system",

    title: notification.title || "Notification",

    body: notification.body || "",

    actorId: notification.actorId || null,

    entityType: notification.entityType || null,

    entityId: notification.entityId || null,

    data: notification.data || {},

    read: false,

    createdAt: serverTimestamp(),
  });
}

export function subscribeUserNotifications(userId, callback, onError) {
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

export async function markNotificationRead(notificationId) {
  if (!notificationId) {
    return;
  }

  const notificationRef = doc(db, "notifications", notificationId);

  await updateDoc(notificationRef, {
    read: true,
  });
}

export async function markAllNotificationsRead(userId, notifications) {
  const unreadNotifications = notifications.filter(
    (notification) => !notification.read,
  );

  if (unreadNotifications.length === 0) {
    return;
  }

  const batch = writeBatch(db);

  unreadNotifications.forEach((notification) => {
    batch.update(
      doc(db, "notifications", notification.id),

      {
        read: true,
      },
    );
  });

  await batch.commit();
}
