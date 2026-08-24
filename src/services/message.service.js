import {
  collection,
  doc,
  getDoc,
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
import { auth } from "../firebase/auth";

const messagesRef = collection(db, "messages");
const conversationsRef = collection(db, "conversations");

/**
 * Send a message.
 *
 * The conversation is read first to determine the receiver.
 * The message creation and conversation update are then committed
 * together in a single batch.
 */
export async function sendMessage({
  conversationId,
  senderId,
  text = "",
  type = "text",
  imageUrl = null,
  imageId = null,
  productId = null,
  quantity = null,
  inquiryStatus = null,
}) {
  const actualSenderId = senderId || auth.currentUser?.uid;

  if (!actualSenderId) {
    throw new Error("User must be authenticated to send messages.");
  }

  const conversationRef = doc(conversationsRef, conversationId);

  const conversationSnapshot = await getDoc(conversationRef);

  if (!conversationSnapshot.exists()) {
    throw new Error("Conversation not found.");
  }

  const conversation = conversationSnapshot.data();

  const receiverId = conversation.participants?.find((id) => id !== actualSenderId);

  if (!receiverId) {
    throw new Error("Unable to determine message recipient.");
  }

  const messageRef = doc(messagesRef);

  const batch = writeBatch(db);

  const messageData = {
    conversationId,
    senderId: actualSenderId,
    text: text || "",
    type: type || "text",
    read: false,
    createdAt: serverTimestamp(),
  };

  if (imageUrl) messageData.imageUrl = imageUrl;
  if (imageId) messageData.imageId = imageId;
  if (productId) messageData.productId = productId;
  if (quantity != null && quantity !== "") messageData.quantity = quantity;
  if (inquiryStatus) messageData.inquiryStatus = inquiryStatus;

  batch.set(messageRef, messageData);

  const lastMessageText =
    type === "image"
      ? text
        ? `📷 ${text}`
        : "📷 Sent a photo"
      : text || "Sent a message";

  batch.update(conversationRef, {
    lastMessage: lastMessageText,
    lastMessageSender: actualSenderId,
    lastMessageAt: serverTimestamp(),
    [`unreadCount.${receiverId}`]: increment(1),
  });

  await batch.commit();

  return messageRef.id;
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

  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs.map((message) => ({
          id: message.id,
          ...message.data(),
        })),
      );
    },
    (error) => {
      console.error("Message listener error:", error);
    },
  );
}

/**
 * Mark a conversation as read for the current user.
 *
 * This uses conversation-level read tracking instead of reading
 * and updating every individual message.
 */
export async function markConversationAsRead(conversationId, currentUserId) {
  const conversationRef = doc(db, "conversations", conversationId);

  await updateDoc(conversationRef, {
    [`lastRead.${currentUserId}`]: serverTimestamp(),
    [`unreadCount.${currentUserId}`]: 0,
  });
}

/**
 * Update a message.
 */
export async function updateMessage(messageId, data) {
  const messageRef = doc(db, "messages", messageId);

  await updateDoc(messageRef, data);
}
