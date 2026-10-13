import { apiRequest } from "./api/api.client";
import { subscribeToRealtime } from "./api/realtime.client";
import {
  getPermanentlyEndedLocations,
  markLocationPermanentlyEnded,
} from "../utils/endedLocations";

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
  return subscribeToRealtime(`/v1/messages/${encodeURIComponent(conversationId)}/stream`,
    (streamedMessages) => {
      const permanentlyEnded = getPermanentlyEndedLocations();
      const docs = streamedMessages.slice(-limitCount).map((rawData) => {
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

        if (isLocationMsg && data.id && permanentlyEnded.has(data.id)) {
          return {
            ...data,
            isLive: false,
            isEnded: true,
            endedAt: data.endedAt || Date.now(),
          };
        }
        return {
          ...data,
        };
      });

      callback(docs, {
        oldestDocSnapshot: null,
        hasMore: false,
        totalLoadedInSnapshot: docs.length,
      });
    },
    (error) => console.error("Message listener error:", error),
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

  const result = await apiGetMessages(conversationId, { cursor: lastDocSnapshot?.id || null, limit: limitCount });
  return { messages: result.messages, oldestDocSnapshot: null, hasMore: result.hasMore };
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
  await apiRequest(`/v1/messages/${encodeURIComponent(messageId)}/live-location`, { method: "PATCH", body: JSON.stringify({ location }) });
}

/**
 * Stop live location sharing for a given message in Firestore and sync to conversation.
 */
export async function stopLiveLocation(messageId, conversationId = null) {
  if (!messageId) return;
  markLocationPermanentlyEnded(messageId);

  await apiRequest(`/v1/messages/${encodeURIComponent(messageId)}/end-live-location`, { method: "PATCH", body: JSON.stringify({ conversationId }) });
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
