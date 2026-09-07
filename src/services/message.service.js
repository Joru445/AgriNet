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
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { auth } from "../firebase/auth";
import { apiRequest } from "./api/api.client";
import {
  encrypt,
  decrypt,
  getConversationKey,
} from "./encryption";

const messagesRef = collection(db, "messages");
const conversationsRef = collection(db, "conversations");

export const DEFAULT_MESSAGE_LIMIT = 40;
const ENCRYPTION_VERSION = 1;

// ============================================================
// ENCRYPTION HELPERS
// ============================================================

/**
 * Encrypt message text for E2E delivery.
 *
 * @param {string} text - Plaintext message text
 * @param {string} conversationId
 * @param {string} senderId
 * @param {string} receiverId
 * @returns {Promise<{ ciphertext: string, iv: string, encryptionVersion: number }>}
 */
async function encryptMessageText(text, conversationId, senderId, receiverId) {
  if (!text) return null;

  try {
    const key = await getConversationKey(senderId, receiverId, conversationId);
    const result = await encrypt(text, key);
    return {
      ciphertext: result.ciphertext,
      iv: result.iv,
      encryptionVersion: ENCRYPTION_VERSION,
    };
  } catch (error) {
    console.error("[E2E] Encryption failed:", error.message);
    const encError = new Error("Failed to encrypt message. Please check your encryption keys.");
    encError.cause = error;
    throw encError;
  }
}

/**
 * Decrypt message text received via E2E.
 *
 * @param {string} ciphertext
 * @param {string} iv
 * @param {number} encryptionVersion
 * @param {string} conversationId
 * @param {string} senderId
 * @param {string} receiverId
 * @returns {Promise<string>} - Decrypted plaintext, or null on failure
 */
async function decryptMessageText(ciphertext, iv, encryptionVersion, conversationId, senderId, receiverId) {
  if (!ciphertext || !iv) return null;
  if (encryptionVersion !== ENCRYPTION_VERSION) return null;

  try {
    const key = await getConversationKey(receiverId, senderId, conversationId);
    return await decrypt(ciphertext, iv, key);
  } catch (error) {
    console.error(
      "[E2E] Decryption failed:",
      error.name || "UnknownError",
      error.message || "(no message)",
      `conversation=${conversationId}`,
      `sender=${senderId}`,
      `receiver=${receiverId}`,
    );
    return null;
  }
}

/**
 * Decrypt a single message object in place.
 * Adds `text` field from decrypted ciphertext.
 * For legacy messages (no encryptionVersion), keeps existing `text`.
 */
async function decryptMessage(message, myUid) {
  // Legacy message — no encryption
  if (!message.encryptionVersion) {
    return message;
  }

  const decryptedText = await decryptMessageText(
    message.ciphertext,
    message.iv,
    message.encryptionVersion,
    message.conversationId,
    message.senderId,
    myUid,
  );

  if (decryptedText === null) {
    return {
      ...message,
      text: null,
      decryptionFailed: true,
    };
  }

  return {
    ...message,
    text: decryptedText,
  };
}

/**
 * Batch-decrypt an array of messages.
 */
async function decryptMessages(messages, myUid) {
  if (!myUid) return messages;

  const results = await Promise.allSettled(
    messages.map((msg) => decryptMessage(msg, myUid)),
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    // Decryption error — return message with fallback text
    return {
      ...messages[index],
      text: null,
      decryptionFailed: true,
    };
  });
}

/**
 * Build the lastMessage preview for a conversation update.
 * For encrypted messages, never store plaintext — use a generic indicator.
 */
function buildEncryptedLastMessage(type) {
  if (type === "image") return "\uD83D\uDCF7 \u25C8 Encrypted image";
  if (type === "product_inquiry") return "\uD83D\uDCEC \u25C8 Encrypted inquiry";
  return "\uD83D\uDD12 \u25C8 Encrypted message";
}

// ============================================================
// SEND MESSAGE (DIRECT FIRESTORE — FALLBACK ONLY)
// ============================================================

/**
 * Send a message via direct Firestore write.
 *
 * ENCRYPTION: Always encrypts text before writing.
 * This is the fallback path when the backend API is unavailable.
 * For encrypted messages, writes ciphertext — never plaintext.
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

  // --- Encrypt text if present ---
  const messageData = {
    conversationId,
    senderId: actualSenderId,
    type: type || "text",
    read: false,
    createdAt: serverTimestamp(),
  };

  if (text) {
    const encrypted = await encryptMessageText(text, conversationId, actualSenderId, receiverId);
    if (encrypted) {
      messageData.ciphertext = encrypted.ciphertext;
      messageData.iv = encrypted.iv;
      messageData.encryptionVersion = encrypted.encryptionVersion;
    } else {
      // Encryption failed — do NOT write plaintext
      throw new Error("Encryption failed. Message not sent.");
    }
  }

  if (imageUrl) messageData.imageUrl = imageUrl;
  if (imageId) messageData.imageId = imageId;
  if (productId) messageData.productId = productId;
  if (quantity != null && quantity !== "") messageData.quantity = quantity;
  if (inquiryStatus) messageData.inquiryStatus = inquiryStatus;
  if (replyTo) messageData.replyTo = replyTo;

  batch.set(messageRef, messageData);

  // --- Conversation update: never store plaintext lastMessage ---
  const lastMessagePreview = buildEncryptedLastMessage(type);

  const conversationUpdates = {
    participants: [actualSenderId, receiverId],
    lastMessage: lastMessagePreview,
    lastMessageSender: actualSenderId,
    lastMessageAt: serverTimestamp(),
    [`unreadCount.${receiverId}`]: increment(1),
  };

  batch.set(conversationRef, conversationUpdates, { merge: true });

  await batch.commit();

  return messageRef.id;
}

// ============================================================
// REALTIME SUBSCRIPTION
// ============================================================

/**
 * Listen to the most recent messages in a conversation.
 * Returns messages in ascending chronological order with pagination metadata.
 * Decrypts encrypted messages client-side.
 */
export function subscribeMessages(
  conversationId,
  callback,
  limitCount = DEFAULT_MESSAGE_LIMIT,
  myUid = null,
) {
  const q = query(
    messagesRef,
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  );

  return onSnapshot(
    q,
    async (snapshot) => {
      const docs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Reverse so UI receives chronological ascending order
      docs.reverse();

      // Decrypt messages
      const uid = myUid || auth.currentUser?.uid;
      const decrypted = await decryptMessages(docs, uid);

      const oldestDocSnapshot =
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1]
          : null;

      const hasMore = snapshot.docs.length >= limitCount;

      callback(decrypted, {
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

// ============================================================
// PAGINATION
// ============================================================

/**
 * Fetch an older page of messages before a given cursor.
 * Decrypts encrypted messages client-side.
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

    // Decrypt messages
    const uid = auth.currentUser?.uid;
    const decrypted = await decryptMessages(docs, uid);

    const oldestDocSnapshot =
      snapshot.docs.length > 0
        ? snapshot.docs[snapshot.docs.length - 1]
        : null;

    const hasMore = snapshot.docs.length >= limitCount;

    return {
      messages: decrypted,
      oldestDocSnapshot,
      hasMore,
    };
  } catch (error) {
    console.error("Failed to fetch older messages:", error);
    return { messages: [], oldestDocSnapshot: null, hasMore: false };
  }
}

// ============================================================
// BACKEND API WRAPPERS
// ============================================================

/**
 * Send a message via the backend API.
 * The data object should already contain encrypted fields if E2E is enabled.
 *
 * IMPORTANT: For encrypted messages, does NOT fall back to direct Firestore
 * write, because the fallback path cannot guarantee encryption integrity.
 * If the backend is unavailable for an encrypted message, the send fails safely.
 */
export async function apiSendMessage(data) {
  try {
    const result = await apiRequest("/messages", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return result?.data?.id || result?.data;
  } catch (err) {
    // For encrypted messages, do NOT fall back to direct Firestore.
    // The fallback cannot guarantee encryption integrity.
    if (data.encryptionVersion) {
      console.error("[E2E] Backend unavailable for encrypted message. Send failed.");
      const encErr = new Error("Unable to send encrypted message. Please try again.");
      encErr.cause = err;
      throw encErr;
    }

    // For non-encrypted messages, preserve legacy fallback
    console.warn("[Messages] Backend API apiSendMessage failed, falling back to Firestore:", err.message);
    return await sendMessage({
      conversationId: data.conversationId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      text: data.text,
      type: data.type,
      imageUrl: data.imageUrl,
      imageId: data.imageId,
      productId: data.productId,
      quantity: data.quantity,
      inquiryStatus: data.inquiryStatus,
      replyTo: data.replyToSnapshot || data.replyTo,
    });
  }
}

export async function apiGetMessages(conversationId, { cursor = null, limit: pageSize = 40 } = {}) {
  try {
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (pageSize !== 40) params.set("limit", String(pageSize));

    const qs = params.toString();
    const endpoint = `/messages/${conversationId}${qs ? `?${qs}` : ""}`;

    const result = await apiRequest(endpoint);

    // Decrypt messages from backend
    const uid = auth.currentUser?.uid;
    const decrypted = await decryptMessages(result.data || [], uid);

    return {
      messages: decrypted,
      cursor: result.cursor,
      hasMore: result.hasMore,
    };
  } catch (err) {
    console.warn("[Messages] Backend API apiGetMessages failed, falling back to Firestore:", err.message);
    // For fallback, pass null for lastDocSnapshot to indicate "no cursor"
    // This won't work for real pagination but preserves compatibility
    return { messages: [], oldestDocSnapshot: null, hasMore: false };
  }
}
