import { auth } from "../firebase/auth";
import { apiRequest } from "./api/api.client";
import { subscribeToRealtime } from "./api/realtime.client";

/**
 * Generate a deterministic ID for a one-to-one conversation.
 *
 * Sorting the UIDs guarantees that:
 *
 * getConversationId("userA", "userB")
 * and
 * getConversationId("userB", "userA")
 *
 * always produce the same ID.
 */
export function getConversationId(uid1, uid2) {
  if (!uid1 || !uid2) return "";
  return [uid1, uid2].sort().join("_");
}

/**
 * Mark a conversation as read for a specific user.
 * Skips write if unreadCount is already 0.
 */
export async function markConversationRead(conversationId, uid, currentUnreadCount = null) {
  if (!conversationId || !uid || currentUnreadCount === 0) return;
  if (uid !== auth.currentUser?.uid) throw new Error("Cannot mark another user's messages as read.");
  return apiMarkConversationRead(conversationId);
}

/**
 * Find a one-to-one conversation between two users.
 * Uses deterministic document ID directly (1 getDoc call).
 */
export async function findConversation(uid1, uid2) {
  if (!uid1 || !uid2) return null;

  return apiFindOrCreateConversation(uid2, { findOnly: true });
}

/**
 * Create a one-to-one conversation.
 *
 * The conversation ID is deterministic, so both users will resolve to
 * the same conversation document.
 *
 * setDoc() is used instead of addDoc() to prevent duplicate conversation
 * documents for the same pair of users.
 */
export async function createConversation(currentUser, otherUser) {
  if (!currentUser?.uid || !otherUser?.uid) throw new Error("Missing participants.");
  const result = await apiRequest("/v1/conversations", {
    method: "POST",
    body: JSON.stringify({ otherUserId: otherUser.uid }),
  });
  return result.data?.id || result.data;
}

/**
 * Get a conversation by ID.
 */
export async function getConversation(conversationId) {
  return apiGetConversationById(conversationId);
}

/**
 * Subscribe to all conversations belonging to a user.
 */
export function subscribeUserConversations(uid, callback) {
  if (!uid) return () => {};
  return subscribeToRealtime("/v1/conversations/stream", callback, (error) => console.error("Conversation listener error:", error));
}

/**
 * Update a conversation.
 */
export async function updateConversation(conversationId, data) {
  // Only explicit, backend-validated conversation mutations are supported.
  // Generic client-side Firestore patching would bypass device-session checks.
  if (data?.endedLocations) return updateConversationEndedLocations(conversationId, Object.keys(data.endedLocations));
  throw new Error("Unsupported conversation update.");
}

/**
 * Record an ended location message in the conversation document.
 * This guarantees real-time propagation to all conversation participants via onSnapshot.
 */
export async function updateConversationEndedLocation(conversationId, messageId) {
  if (!conversationId || !messageId) return;
  await updateConversationEndedLocations(conversationId, [messageId]);
}

/**
 * Record multiple ended location messages in the conversation document in a single write.
 */
export async function updateConversationEndedLocations(conversationId, messageIds) {
  if (!conversationId || !messageIds?.length) return;
  await apiRequest(`/v1/conversations/${encodeURIComponent(conversationId)}/ended-locations`, {
    method: "PATCH",
    body: JSON.stringify({ messageIds }),
  });
}

/*
 * ============================================================
 * BACKEND API WRAPPERS
 *
 * Migrated to Express backend. The Firebase functions above are
 * preserved as rollback implementations.
 * ============================================================
 */

/**
 * Get conversations from the backend API.
 */
export async function apiGetConversations() {
  try {
    const response = await apiRequest("/v1/conversations");
    return response.data;
  } catch (err) {
    console.warn("[Conversations] Backend API getConversations failed:", err.message);
    return [];
  }
}

export async function apiGetConversationById(conversationId) {
  try {
    const response = await apiRequest(`/v1/conversations/${conversationId}`);
    return response.data;
  } catch (err) {
    console.warn("[Conversations] Backend API getConversationById failed:", err.message);
    return null;
  }
}

export async function apiFindOrCreateConversation(otherUserId, { findOnly = false } = {}) {
  try {
    const response = await apiRequest("/v1/conversations", {
      method: "POST",
      body: JSON.stringify({ otherUserId, findOnly }),
    });
    return response.data?.id || response.data;
  } catch (err) {
    if (findOnly) {
      return null;
    }

    throw err;
  }
}

export async function apiMarkConversationRead(conversationId) {
  const response = await apiRequest(
    `/v1/conversations/${encodeURIComponent(conversationId)}/read`,
    { method: "PATCH" },
  );
  return response?.data;
}
