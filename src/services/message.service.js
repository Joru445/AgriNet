import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { getConversation, updateConversation } from "./conversation.service";

const messagesRef = collection(db, "messages");

/**
 * Send a message.
 */
export async function sendMessage({
  conversationId,
  senderId,
  text,
  type = "text",
  productId = null,
  inquiryStatus = null,
}) {
  await addDoc(messagesRef, {
    conversationId,
    senderId,
    text,
    type,
    productId,
    inquiryStatus,
    read: false,
    createdAt: serverTimestamp(),
  });

  const conversation = await getConversation(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  const receiverId = conversation.participants.find((id) => id !== senderId);

  await updateConversation(conversationId, {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    [`unreadCount.${receiverId}`]: increment(1),
  });
}

/**
 * Listen to messages in a conversation.
 */
export function subscribeMessages(conversationId, callback) {
  const q = query(
    messagesRef,
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc"),
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    );
  });
}

/**
 * Mark all unread messages as read.
 */
export async function markConversationAsRead(conversationId, currentUserId) {
  const q = query(messagesRef, where("conversationId", "==", conversationId));

  const snapshot = await getDocs(q);

  const batch = writeBatch(db);

  snapshot.forEach((message) => {
    const data = message.data();

    if (data.senderId !== currentUserId && !data.read) {
      batch.update(message.ref, {
        read: true,
      });
    }
  });

  await batch.commit();
}

export async function updateMessage(
  messageId,
  data,
) {
  const messageRef = doc(
    db,
    "messages",
    messageId,
  );

  await updateDoc(messageRef, data);
}
