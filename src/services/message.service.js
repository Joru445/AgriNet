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
// Kept for older imports. Same authoritative API path for ALL new messages.
export async function sendMessage(data) {
  return apiSendMessage(data);
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
        const rawData = docSnap.data();
        const data = {
          ...rawData,
          createdAt: rawData.createdAt || { seconds: Math.floor(Date.now() / 1000) },
        };
        const isLocationMsg =
          Boolean(data.location) ||
          data.type === "location" ||
          data.type === "live_location" ||
          data.locationType === "location" ||
          data.locationType === "live_location";

        if (isLocationMsg && docSnap.id && permanentlyEnded.has(docSnap.id)) {
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
      const isLocationMsg =
        Boolean(data.location) ||
        data.type === "location" ||
        data.type === "live_location" ||
        data.locationType === "location" ||
        data.locationType === "live_location";

      if (isLocationMsg && docSnap.id && permanentlyEnded.has(docSnap.id)) {
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
  const clientMessageId = data.clientMessageId ?? crypto.randomUUID();
  const replyTo = typeof data.replyTo === "string" ? data.replyTo : null;
  const result = await apiRequest("/v1/messages", {
    method: "POST",
    body: JSON.stringify({ ...data, replyTo, clientMessageId }),
  });
  return result?.data?.id || result?.data;
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
