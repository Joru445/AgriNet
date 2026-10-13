import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { auth } from "../firebase/auth";
import { apiRequest } from "./api/api.client";

const conversationsRef = collection(db, "conversations");

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

  try {
    const conversationId = getConversationId(uid1, uid2);
    const conversationRef = doc(db, "conversations", conversationId);
    const snapshot = await getDoc(conversationRef);

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      };
    }
  } catch (error) {
    console.error("Failed to find conversation:", error);
  }

  return null;
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
  const conversationRef = doc(db, "conversations", conversationId);

  const snapshot = await getDoc(conversationRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

/**
 * Subscribe to all conversations belonging to a user.
 */
export function subscribeUserConversations(uid, callback) {
  const q = query(
    conversationsRef,
    where("participants", "array-contains", uid),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((conversation) => ({
        id: conversation.id,
        ...conversation.data(),
      }));

      docs.sort(
        (a, b) =>
          (b.lastMessageAt?.seconds ?? 0) - (a.lastMessageAt?.seconds ?? 0),
      );

      callback(docs);
    },
    (error) => {
      console.error("Conversation listener error:", error);
    },
  );
}

/**
 * Update a conversation.
 */
export async function updateConversation(conversationId, data) {
  const conversationRef = doc(db, "conversations", conversationId);

  await updateDoc(conversationRef, data);
}

/**
 * Record an ended location message in the conversation document.
 * This guarantees real-time propagation to all conversation participants via onSnapshot.
 */
export async function updateConversationEndedLocation(conversationId, messageId) {
  if (!conversationId || !messageId) return;
  try {
    const conversationRef = doc(db, "conversations", conversationId);
    await updateDoc(conversationRef, {
      [`endedLocations.${messageId}`]: true,
      lastEndedLocationAt: Date.now(),
    });
  } catch (error) {
    console.warn("[Conversations] updateDoc endedLocations failed, attempting setDoc merge:", error);
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      await setDoc(
        conversationRef,
        {
          endedLocations: {
            [messageId]: true,
          },
          lastEndedLocationAt: Date.now(),
        },
        { merge: true },
      );
    } catch (innerError) {
      console.error("[Conversations] Failed to set endedLocations in conversation:", innerError);
    }
  }
}

/**
 * Record multiple ended location messages in the conversation document in a single write.
 */
export async function updateConversationEndedLocations(conversationId, messageIds) {
  if (!conversationId || !messageIds?.length) return;
  const updates = {
    lastEndedLocationAt: Date.now(),
  };
  const mapUpdates = {};
  messageIds.forEach((id) => {
    updates[`endedLocations.${id}`] = true;
    mapUpdates[id] = true;
  });

  try {
    const conversationRef = doc(db, "conversations", conversationId);
    await updateDoc(conversationRef, updates);
  } catch {
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      await setDoc(
        conversationRef,
        {
          endedLocations: mapUpdates,
          lastEndedLocationAt: Date.now(),
        },
        { merge: true },
      );
    } catch (innerError) {
      console.error("[Conversations] Failed to update endedLocations in conversation:", innerError);
    }
  }
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
