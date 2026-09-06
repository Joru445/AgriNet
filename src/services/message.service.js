import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { auth } from "../firebase/auth";
import { apiRequest } from "./api/api.client";

const messagesRef = collection(db, "messages");
const conversationsRef = collection(db, "conversations");

export const DEFAULT_MESSAGE_LIMIT = 40;

/**
 * Send a message.
 *
 * Receiver ID is derived from parameters or deterministic conversation ID
 * to avoid unnecessary getDoc() reads before batch commit.
 */
export async function sendMessage({
  conversationId,
  senderId,
  receiverId: explicitReceiverId = null,
  text = "",
  type = "text",
  imageUrl = null,
  imageId = null,
  productId = null,
  quantity = null,
  inquiryStatus = null,
  replyTo = null,
}) {
  const actualSenderId = senderId || auth.currentUser?.uid;

  if (!actualSenderId) {
    throw new Error("User must be authenticated to send messages.");
  }

  let receiverId = explicitReceiverId;

  // Derive receiverId from deterministic ID without a Firestore read
  if (!receiverId && conversationId && conversationId.includes("_")) {
    const parts = conversationId.split("_");
    if (parts.length === 2) {
      receiverId = parts.find((id) => id !== actualSenderId) || null;
    }
  }

  const conversationRef = doc(conversationsRef, conversationId);

  // Fallback to getDoc only if receiverId could not be determined
  if (!receiverId) {
    const conversationSnapshot = await getDoc(conversationRef);

    if (!conversationSnapshot.exists()) {
      throw new Error("Conversation not found.");
    }

    const conversation = conversationSnapshot.data();
    receiverId = conversation.participants?.find((id) => id !== actualSenderId);
  }

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
  if (replyTo) messageData.replyTo = replyTo;

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
 * Listen to the most recent messages in a conversation.
 * Returns messages in ascending chronological order with pagination metadata.
 */
export function subscribeMessages(
  conversationId,
  callback,
  limitCount = DEFAULT_MESSAGE_LIMIT,
) {
  const q = query(
    messagesRef,
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Reverse so UI receives chronological ascending order
      docs.reverse();

      const oldestDocSnapshot =
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1]
          : null;

      const hasMore = snapshot.docs.length >= limitCount;

      callback(docs, {
        oldestDocSnapshot,
        hasMore,
        totalLoadedInSnapshot: snapshot.docs.length,
      });
    },
    (error) => {
      console.error("Message listener error:", error);
    },
  );
}

/**
 * Fetch an older page of messages before a given cursor.
 */
export async function fetchOlderMessages(
  conversationId,
  lastDocSnapshot,
  limitCount = DEFAULT_MESSAGE_LIMIT,
) {
  if (!conversationId || !lastDocSnapshot) {
    return { messages: [], oldestDocSnapshot: null, hasMore: false };
  }

  try {
    const q = query(
      messagesRef,
      where("conversationId", "==", conversationId),
      orderBy("createdAt", "desc"),
      startAfter(lastDocSnapshot),
      limit(limitCount),
    );

    const snapshot = await getDocs(q);

    const docs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // Reverse to chronological order
    docs.reverse();

    const oldestDocSnapshot =
      snapshot.docs.length > 0
        ? snapshot.docs[snapshot.docs.length - 1]
        : null;

    const hasMore = snapshot.docs.length >= limitCount;

    return {
      messages: docs,
      oldestDocSnapshot,
      hasMore,
    };
  } catch (error) {
    console.error("Failed to fetch older messages:", error);
    return { messages: [], oldestDocSnapshot: null, hasMore: false };
  }
}

/**
 * Mark a conversation as read for the current user.
 * Skips write if unreadCount is already 0.
 */
export async function markConversationAsRead(
  conversationId,
  currentUserId,
  currentUnreadCount = null,
) {
  if (!conversationId || !currentUserId) return;

  if (currentUnreadCount === 0) {
    return;
  }

  try {
    const conversationRef = doc(db, "conversations", conversationId);
    await updateDoc(conversationRef, {
      [`lastRead.${currentUserId}`]: serverTimestamp(),
      [`unreadCount.${currentUserId}`]: 0,
    });
  } catch (error) {
    console.error("Failed to mark conversation read:", error);
  }
}

/**
 * Update a message.
 */
export async function updateMessage(messageId, data) {
  const messageRef = doc(db, "messages", messageId);

  await updateDoc(messageRef, data);
}

// ============================================================
// BACKEND API WRAPPERS
// ============================================================

export async function apiSendMessage(data) {
  const result = await apiRequest("/messages", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return result.data.id;
}

export async function apiGetMessages(conversationId, { cursor = null, limit: pageSize = 40 } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (pageSize !== 40) params.set("limit", String(pageSize));

  const qs = params.toString();
  const endpoint = `/messages/${conversationId}${qs ? `?${qs}` : ""}`;

  const result = await apiRequest(endpoint);

  return {
    messages: result.data,
    cursor: result.cursor,
    hasMore: result.hasMore,
  };
}
