import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

const notificationsRef = collection(db, "notifications");

// ============================================================
// DETERMINISTIC NOTIFICATION IDS
// ============================================================

export function getMessageNotificationId(messageId, recipientId) {
  if (!messageId || !recipientId) return null;

  return `message_${messageId}_${recipientId}`;
}

export function getInquiryNotificationId(
  inquiryId,
  eventType,
  recipientId,
) {
  if (!inquiryId || !eventType || !recipientId) return null;

  return `inquiry_${inquiryId}_${eventType}_${recipientId}`;
}

export function getReportNotificationId(
  reportId,
  eventType,
  recipientId,
) {
  if (!reportId || !eventType || !recipientId) return null;

  return `report_${reportId}_${eventType}_${recipientId}`;
}

export function getProductReviewNotificationId(
  inquiryId,
  recipientId,
) {
  if (!inquiryId || !recipientId) return null;

  return `product_review_${inquiryId}_${recipientId}`;
}

export function getFarmerReviewNotificationId(
  reviewId,
  recipientId,
) {
  if (!reviewId || !recipientId) return null;

  return `farmer_review_${reviewId}_${recipientId}`;
}

// ============================================================
// CREATE NOTIFICATION
// ============================================================

/**
 * Creates a notification using a deterministic document ID.
 *
 * IMPORTANT:
 * The notification ID must represent the underlying event.
 *
 * Example:
 * message_<messageId>_<recipientId>
 *
 * This prevents separate notification documents from being created
 * for the same event.
 */
export async function createNotificationIdempotent({
  notificationId,
  data,
}) {
  if (!notificationId) {
    throw new Error("Deterministic notification ID is required.");
  }

  if (!data?.recipientId) {
    throw new Error("Notification recipient is required.");
  }

  if (!data?.actorId) {
    throw new Error("Notification actor is required.");
  }

  if (data.actorId === data.recipientId) {
    throw new Error("A user cannot receive their own notification.");
  }

  const notificationRef = doc(
    db,
    "notifications",
    notificationId,
  );

  await setDoc(notificationRef, {
    recipientId: data.recipientId,
    actorId: data.actorId,

    type: data.type || "system",
    title: data.title || "Notification",
    body: data.body || "",

    entityType: data.entityType || null,
    entityId: data.entityId || null,
    data: data.data || {},

    read: false,
    createdAt: serverTimestamp(),
  });

  return notificationId;
}

// ============================================================
// SUBSCRIBE
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
// MARK AS READ
// ============================================================

export async function markNotificationRead(notificationId) {
  if (!notificationId) return;

  const notificationRef = doc(
    db,
    "notifications",
    notificationId,
  );

  await updateDoc(notificationRef, {
    read: true,
  });
}

// ============================================================
// MARK ALL AS READ
// ============================================================

export async function markAllNotificationsRead(
  userId,
  notifications = [],
) {
  if (!userId || notifications.length === 0) {
    return;
  }

  const unreadNotifications = notifications.filter(
    (notification) =>
      !notification.read &&
      notification.recipientId === userId,
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

// ============================================================
// DELETE
// ============================================================

export async function deleteNotification(notificationId) {
  if (!notificationId) return;

  await deleteDoc(
    doc(db, "notifications", notificationId),
  );
}