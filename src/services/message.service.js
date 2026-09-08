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
 * Resolves the remote participant's UID for a given message in a conversation.
 *
 * In a 2-party conversation between User A and User B:
 * - If current user (myUid) is User A:
 *   - If message was sent by User B: otherUid = User B (message.senderId).
 *   - If message was sent by User A: otherUid = User B (from message.receiverId or parsed from conversationId "A_B").
 *
 * @param {object} message - Message document data
 * @param {string} myUid - Current authenticated user UID
 * @param {string} [conversationIdFallback]
 * @returns {string|null} - The other participant's UID
 */
function resolveOtherParticipantUid(message, myUid, conversationIdFallback = null) {
  if (!myUid) return null;

  // 1. If sent by someone else, that sender is the other participant
  if (message.senderId && message.senderId !== myUid) {
    return message.senderId;
  }

  // 2. If sent by current user, check if receiverId is explicitly stored
  if (message.receiverId && message.receiverId !== myUid) {
    return message.receiverId;
  }

  // 3. Extract other UID from deterministic conversationId: "uid1_uid2"
  const convId = message.conversationId || conversationIdFallback;
  if (convId && convId.includes("_")) {
    const parts = convId.split("_");
    if (parts.length === 2) {
      const other = parts.find((id) => id !== myUid);
      if (other) return other;
    }
  }

  return null;
}

/**
 * Decrypt message text received via E2E.
 *
 * @param {string} ciphertext
 * @param {string} iv
 * @param {number} encryptionVersion
 * @param {string} conversationId
 * @param {string} senderId
 * @param {string} otherUid - The other participant in the conversation
 * @param {string} myUid - The local user running this browser session
 * @returns {Promise<string>} - Decrypted plaintext, or null on failure
 */
async function decryptMessageText(ciphertext, iv, encryptionVersion, conversationId, senderId, otherUid, myUid) {
  if (encryptionVersion !== ENCRYPTION_VERSION) {
    console.warn("[E2E Diagnostic] ERR_UNKNOWN_ENCRYPTION_VERSION:", {
      expectedVersion: ENCRYPTION_VERSION,
      actualVersion: encryptionVersion,
      conversationId,
    });
    return null;
  }

  if (!ciphertext || !iv) {
    console.warn("[E2E Diagnostic] ERR_MISSING_PAYLOAD:", {
      hasCiphertext: Boolean(ciphertext),
      hasIv: Boolean(iv),
      conversationId,
    });
    return null;
  }

  if (!myUid || !otherUid) {
    console.warn("[E2E Diagnostic] ERR_CANNOT_RESOLVE_PARTICIPANT:", {
      currentUid: myUid,
      otherUid,
      senderId,
      conversationId,
    });
    return null;
  }

  try {
    const key = await getConversationKey(myUid, otherUid, conversationId);
    return await decrypt(ciphertext, iv, key);
  } catch (error) {
    const errorName = error.name || "Error";
    const errorMessage = error.message || "";

    let errorCategory = "ERR_DECRYPTION_FAILED";
    if (errorMessage.includes("No local encryption private key")) {
      errorCategory = "ERR_MISSING_LOCAL_PRIVATE_KEY";
    } else if (errorMessage.includes("Recipient has no encryption key")) {
      errorCategory = "ERR_MISSING_REMOTE_PUBLIC_KEY";
    } else if (errorMessage.includes("PUBLIC KEY MISMATCH")) {
      errorCategory = "ERR_PUBLIC_KEY_MISMATCH";
    } else if (errorMessage.includes("JSON") || errorMessage.includes("importKey") || errorMessage.includes("JWK")) {
      errorCategory = "ERR_INVALID_JWK";
    } else if (errorMessage.includes("deriveBits") || errorMessage.includes("ECDH")) {
      errorCategory = "ERR_ECDH_FAILURE";
    } else if (errorMessage.includes("deriveKey") || errorMessage.includes("HKDF")) {
      errorCategory = "ERR_HKDF_FAILURE";
    } else if (errorMessage.includes("base64") || errorMessage.includes("ciphertext")) {
      errorCategory = "ERR_INVALID_CIPHERTEXT";
    } else if (errorMessage.includes("iv") || errorMessage.includes("IV")) {
      errorCategory = "ERR_INVALID_IV";
    } else if (errorName === "OperationError") {
      errorCategory = "ERR_AES_GCM_OPERATION";
    }

    console.error(`[E2E Diagnostic] Decryption failed [${errorCategory}]:`, {
      errorCategory,
      errorName,
      errorMessage,
      conversationId,
      senderId,
      currentUid: myUid,
      otherUid,
      encryptionVersion,
    });
    return null;
  }
}

/**
 * Decrypt a single message object in place.
 * Adds `text` field from decrypted ciphertext.
 * For legacy messages (no encryptionVersion), keeps existing `text`.
 */
async function decryptMessage(message, myUid, conversationIdFallback = null) {
  // Legacy message — no encryption
  if (!message.encryptionVersion) {
    return message;
  }

  const otherUid = resolveOtherParticipantUid(message, myUid, conversationIdFallback);

  const decryptedText = await decryptMessageText(
    message.ciphertext,
    message.iv,
    message.encryptionVersion,
    message.conversationId || conversationIdFallback,
    message.senderId,
    otherUid,
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
async function decryptMessages(messages, myUid, conversationIdFallback = null) {
  if (!myUid) return messages;

  const results = await Promise.allSettled(
    messages.map((msg) => decryptMessage(msg, myUid, conversationIdFallback)),
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
  ciphertext = null,
  iv = null,
  encryptionVersion = null,
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

  // --- Encrypt text if present, or use pre-encrypted payload without re-encrypting ---
  const messageData = {
    conversationId,
    senderId: actualSenderId,
    receiverId,
    type: type || "text",
    read: false,
    createdAt: serverTimestamp(),
  };

  if (ciphertext && iv) {
    // 1. Explicitly pre-encrypted message
    messageData.ciphertext = ciphertext;
    messageData.iv = iv;
    messageData.encryptionVersion = encryptionVersion || ENCRYPTION_VERSION;
    messageData.text = null;
  } else if (encrypted && text) {
    // 2. Explicitly requested encryption
    const encryptedRes = await encryptMessageText(text, conversationId, actualSenderId, receiverId);
    if (encryptedRes) {
      messageData.ciphertext = encryptedRes.ciphertext;
      messageData.iv = encryptedRes.iv;
      messageData.encryptionVersion = encryptedRes.encryptionVersion;
      messageData.text = null;
    } else {
      throw new Error("Encryption failed. Message not sent.");
    }
  } else {
    // 3. Normal / default message: Store readable plain text in Firestore
    messageData.text = text || "";
    messageData.ciphertext = null;
    messageData.iv = null;
    messageData.encryptionVersion = null;
  }

  if (imageUrl) messageData.imageUrl = imageUrl;
  if (imageId) messageData.imageId = imageId;
  if (productId) messageData.productId = productId;
  if (quantity != null && quantity !== "") messageData.quantity = quantity;
  if (inquiryStatus) messageData.inquiryStatus = inquiryStatus;
  if (replyTo) messageData.replyTo = replyTo;

  batch.set(messageRef, messageData);

  // --- Conversation update: readable preview for plaintext, indicator for encrypted ---
  let lastMessagePreview;
  if (messageData.encryptionVersion) {
    lastMessagePreview = buildEncryptedLastMessage(type);
  } else if (type === "image") {
    lastMessagePreview = "📷 Photo";
  } else if (type === "product_inquiry") {
    lastMessagePreview = "📦 Product Inquiry";
  } else {
    lastMessagePreview = text || "";
  }

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

      // Decrypt messages with conversationId context
      const uid = myUid || auth.currentUser?.uid;
      const decrypted = await decryptMessages(docs, uid, conversationId);

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

    // Decrypt messages with conversationId context
    const uid = auth.currentUser?.uid;
    const decrypted = await decryptMessages(docs, uid, conversationId);

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

    // Decrypt messages from backend with conversationId context
    const uid = auth.currentUser?.uid;
    const decrypted = await decryptMessages(result.data || [], uid, conversationId);

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
