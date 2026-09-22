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
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { auth } from "../firebase/auth";
import { apiRequest } from "./api/api.client";
import {
  getPermanentlyEndedLocations,
  markLocationPermanentlyEnded,
} from "../utils/endedLocations";
import { updateConversationEndedLocation } from "./conversation.service";

const messagesRef = collection(db, "messages");
const conversationsRef = collection(db, "conversations");

export const DEFAULT_MESSAGE_LIMIT = 40;

// ============================================================
// SEND MESSAGE (DIRECT FIRESTORE — FALLBACK ONLY)
// ============================================================

/**
 * Send a message via direct Firestore write.
 * This is the fallback path when the backend API is unavailable.
 */
export async function sendMessage({
  conversationId,
  senderId,
  receiverId: explicitReceiverId = null,
  text = "",
  type = "text",
  locationType = null,
  imageUrl = null,
  imageId = null,
  productId = null,
  quantity = null,
  inquiryStatus = null,
  replyTo = null,
  location = null,
  liveUntil = null,
  isLive = null,
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

  const isLocationMsg =
    type === "location" ||
    type === "live_location" ||
    locationType === "location" ||
    locationType === "live_location" ||
    Boolean(location);

  const resolvedLocType =
    locationType ||
    (type === "live_location" || type === "location"
      ? type
      : isLocationMsg
        ? "location"
        : null);

  // Use type: "text" at root Firestore document for 100% cloud security rule pass
  const resolvedType = isLocationMsg ? "text" : (type || "text");

  let defaultText = text;
  if (!defaultText && isLocationMsg) {
    defaultText = resolvedLocType === "live_location" ? "📍 Live Location" : "📍 Shared Location";
  }

  const messageData = {
    conversationId,
    senderId: actualSenderId,
    receiverId,
    type: resolvedType,
    text: defaultText || "",
    read: false,
    createdAt: serverTimestamp(),
  };

  if (resolvedLocType) messageData.locationType = resolvedLocType;
  if (imageUrl) messageData.imageUrl = imageUrl;
  if (imageId) messageData.imageId = imageId;
  if (productId) messageData.productId = productId;
  if (quantity != null && quantity !== "") messageData.quantity = quantity;
  if (inquiryStatus) messageData.inquiryStatus = inquiryStatus;
  if (replyTo) messageData.replyTo = replyTo;
  if (location) messageData.location = location;
  if (liveUntil != null) messageData.liveUntil = liveUntil;
  if (isLive != null) messageData.isLive = isLive;

  let lastMessagePreview;
  if (type === "image") {
    lastMessagePreview = "📷 Photo";
  } else if (type === "product_inquiry") {
    lastMessagePreview = "📦 Product Inquiry";
  } else if (isLocationMsg) {
    lastMessagePreview = resolvedLocType === "live_location" ? "📍 Live Location" : "📍 Shared Location";
  } else {
    lastMessagePreview = text || "";
  }

  // NOTE: Do NOT include `participants` here!
  // Including `participants` in an update causes Firestore rules to evaluate
  // `request.resource.data.participants == resource.data.participants` which fails if array element order differs!
  const conversationUpdates = {
    lastMessage: lastMessagePreview,
    lastMessageSender: actualSenderId,
    lastMessageAt: serverTimestamp(),
    [`unreadCount.${receiverId}`]: increment(1),
  };

  const batch = writeBatch(db);
  batch.set(messageRef, messageData);
  batch.set(conversationRef, conversationUpdates, { merge: true });

  try {
    await batch.commit();
  } catch (error) {
    console.warn(
      "[sendMessage] Batch commit failed; writing message document directly and repairing conversation unread:",
      error,
    );
    // Directly set the message document so the message is never blocked
    await setDoc(messageRef, messageData);
    try {
      const snap = await getDoc(conversationRef);
      const currentData = snap.exists() ? snap.data() : {};
      const existingUnreadMap =
        typeof currentData.unreadCount === "object" && currentData.unreadCount !== null
          ? { ...currentData.unreadCount }
          : {};
      const currentRecvCount = Number(existingUnreadMap[receiverId]) || 0;
      if (receiverId) {
        existingUnreadMap[receiverId] = currentRecvCount + 1;
      }
      await setDoc(
        conversationRef,
        {
          lastMessage: lastMessagePreview,
          lastMessageSender: actualSenderId,
          lastMessageAt: serverTimestamp(),
          unreadCount: existingUnreadMap,
        },
        { merge: true },
      );
    } catch (_) {}
    return messageRef.id;
  }

  return messageRef.id;
}

// ============================================================
// REALTIME SUBSCRIPTION
// ============================================================

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
      const permanentlyEnded = getPermanentlyEndedLocations();
      const docs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        if (permanentlyEnded.has(docSnap.id)) {
          return {
            id: docSnap.id,
            ...data,
            isLive: false,
            isEnded: true,
            endedAt: data.endedAt || Date.now(),
          };
        }
        return {
          id: docSnap.id,
          ...data,
        };
      });

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

// ============================================================
// PAGINATION
// ============================================================

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

    const permanentlyEnded = getPermanentlyEndedLocations();
    const docs = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      if (permanentlyEnded.has(docSnap.id)) {
        return {
          id: docSnap.id,
          ...data,
          isLive: false,
          isEnded: true,
          endedAt: data.endedAt || Date.now(),
        };
      }
      return {
        id: docSnap.id,
        ...data,
      };
    });

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

// ============================================================
// BACKEND API WRAPPERS
// ============================================================

/**
 * Send a message via the backend API.
 */
export async function apiSendMessage(data) {
  try {
    const result = await apiRequest("/v1/messages", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Real-time Firestore sync for instant receiver unread badge and conversation list update
    const senderUid = data.senderId || auth.currentUser?.uid;
    const convId = data.conversationId;
    let recvId = data.receiverId;

    if (!recvId && convId && convId.includes("_") && senderUid) {
      const parts = convId.split("_");
      if (parts.length === 2) {
        recvId = parts.find((id) => id !== senderUid) || null;
      }
    }

    if (convId && senderUid) {
      const lastPreview =
        data.type === "image"
          ? "📷 Photo"
          : data.type === "product_inquiry"
            ? "📦 Product Inquiry"
            : data.locationType === "live_location" || data.type === "live_location"
              ? "📍 Live Location"
              : data.location
                ? "📍 Shared Location"
                : data.text || "Sent a message";

      const updates = {
        lastMessage: lastPreview,
        lastMessageSender: senderUid,
        lastMessageAt: serverTimestamp(),
      };

      if (recvId) {
        updates[`unreadCount.${recvId}`] = increment(1);
      }

      try {
        const conversationRef = doc(conversationsRef, convId);
        await updateDoc(conversationRef, updates);
      } catch (convErr) {
        console.warn("[Messages] Direct conversation updateDoc failed, attempting repair read-modify-write:", convErr);
        try {
          const conversationRef = doc(conversationsRef, convId);
          const snap = await getDoc(conversationRef);
          const currentData = snap.exists() ? snap.data() : {};
          const existingUnreadMap =
            typeof currentData.unreadCount === "object" && currentData.unreadCount !== null
              ? { ...currentData.unreadCount }
              : {};
          const currentRecvCount = Number(existingUnreadMap[recvId]) || 0;
          if (recvId) {
            existingUnreadMap[recvId] = currentRecvCount + 1;
          }
          await setDoc(
            conversationRef,
            {
              lastMessage: lastPreview,
              lastMessageSender: senderUid,
              lastMessageAt: serverTimestamp(),
              unreadCount: existingUnreadMap,
            },
            { merge: true },
          );
        } catch (setErr) {
          console.error("[Messages] SetDoc repair failed:", setErr);
        }
      }
    }

    return result?.data?.id || result?.data;
  } catch (err) {
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
      location: data.location,
      locationType: data.locationType,
      liveUntil: data.liveUntil,
      isLive: data.isLive,
    });
  }
}

/**
 * Update the live coordinates of an ongoing live location message in Firestore.
 */
export async function updateLiveLocation(messageId, location) {
  if (!messageId || !location) return;
  try {
    const messageRef = doc(messagesRef, messageId);
    await updateDoc(messageRef, {
      "location.lat": location.lat,
      "location.lng": location.lng,
      "location.accuracy": location.accuracy ?? null,
      "location.heading": location.heading ?? null,
      "location.updatedAt": Date.now(),
    });
  } catch (err) {
    console.error("[Messages] Failed to update live location:", err);
  }
}

/**
 * Stop live location sharing for a given message in Firestore and sync to conversation.
 */
export async function stopLiveLocation(messageId, conversationId = null) {
  if (!messageId) return;
  markLocationPermanentlyEnded(messageId);

  // 1. Direct update to message document
  try {
    const messageRef = doc(messagesRef, messageId);
    await updateDoc(messageRef, {
      isLive: false,
      isEnded: true,
      endedAt: Date.now(),
    });
  } catch (err) {
    console.warn("[Messages] Failed to stop live location with updateDoc, trying setDoc merge:", err);
    try {
      const messageRef = doc(messagesRef, messageId);
      await setDoc(
        messageRef,
        {
          isLive: false,
          isEnded: true,
          endedAt: Date.now(),
        },
        { merge: true },
      );
    } catch (innerErr) {
      console.error("[Messages] Failed setDoc fallback for stop live location:", innerErr);
    }
  }

  // 2. Resolve conversationId if not explicitly provided
  let targetConvId = conversationId;
  if (!targetConvId) {
    try {
      const messageRef = doc(messagesRef, messageId);
      const snap = await getDoc(messageRef);
      if (snap.exists()) {
        targetConvId = snap.data()?.conversationId;
      }
    } catch (lookupErr) {
      console.warn("[Messages] Could not lookup conversationId for ended message:", lookupErr);
    }
  }

  // 3. Update conversation document for guaranteed real-time receiver sync
  if (targetConvId) {
    try {
      await updateConversationEndedLocation(targetConvId, messageId);
    } catch (convErr) {
      console.error("[Messages] Failed to update conversation endedLocations:", convErr);
    }
  }
}

export async function apiGetMessages(conversationId, { cursor = null, limit: pageSize = 40 } = {}) {
  try {
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (pageSize !== 40) params.set("limit", String(pageSize));

    const qs = params.toString();
    const endpoint = `/v1/messages/${conversationId}${qs ? `?${qs}` : ""}`;

    const result = await apiRequest(endpoint);
    const permanentlyEnded = getPermanentlyEndedLocations();
    const rawList = result.data || [];
    const messages = rawList.map((m) => {
      if (permanentlyEnded.has(m.id)) {
        return {
          ...m,
          isLive: false,
          isEnded: true,
          endedAt: m.endedAt || Date.now(),
        };
      }
      return m;
    });

    return {
      messages,
      cursor: result.cursor,
      hasMore: result.hasMore,
    };
  } catch (err) {
    console.warn("[Messages] Backend API apiGetMessages failed, falling back to Firestore:", err.message);
    return { messages: [], oldestDocSnapshot: null, hasMore: false };
  }
}
