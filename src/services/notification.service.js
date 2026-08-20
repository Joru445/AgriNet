import {
  addDoc,
  collection,
  doc,
  getDocs,
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

export function createNotification({
  userId,
  type,
  title,
  message,
  targetType = null,
  targetId = null,
}) {
  return addDoc(notificationsRef, {
    userId,
    type,
    title,
    message,
    read: false,
    targetType,
    targetId,
    createdAt: serverTimestamp(),
  });
}

export function subscribeNotifications(userId, callback) {
  if (!userId) {
    return () => {};
  }

  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((notificationDoc) => ({
      id: notificationDoc.id,
      ...notificationDoc.data(),
    }));

    callback(notifications);
  });
}

export function markNotificationAsRead(notificationId) {
  return updateDoc(doc(db, "notifications", notificationId), {
    read: true,
  });
}

export async function markAllNotificationsAsRead(userId) {
  if (!userId) return;

  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    where("read", "==", false),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  const batch = writeBatch(db);

  snapshot.docs.forEach((notificationDoc) => {
    batch.update(notificationDoc.ref, {
      read: true,
    });
  });

  return batch.commit();
}
