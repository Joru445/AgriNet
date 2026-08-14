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
  text,
  type = "text",
  productId = null,
  inquiryStatus = null,
}) {
  const conversationRef = doc(conversationsRef, conversationId);

  const conversationSnapshot = await getDoc(conversationRef);

  if (!conversationSnapshot.exists()) {
    throw new Error("Conversation not found.");
  }

  const conversation = conversationSnapshot.data();

  const receiverId = conversation.participants?.find((id) => id !== senderId);

  if (!receiverId) {
    throw new Error("Unable to determine message recipient.");
  }

  const messageRef = doc(messagesRef);

  const batch = writeBatch(db);

  batch.set(messageRef, {
    conversationId,
    senderId,
    text,
    type,
    productId,
    inquiryStatus,
    read: false,
    createdAt: serverTimestamp(),
  });

  batch.update(conversationRef, {
    lastMessage: text,
    lastMessageSender: senderId,
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
export async function markConversationAsRead(
  conversationId,
  currentUserId,
) {
  const conversationRef = doc(
    db,
    "conversations",
    conversationId,
  );

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
