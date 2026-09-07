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
  const conversationId = getConversationId(currentUser.uid, otherUser.uid);

  const conversationRef = doc(db, "conversations", conversationId);

  await setDoc(conversationRef, {
    participants: [currentUser.uid, otherUser.uid],

    participantInfo: {
      [currentUser.uid]: {
        fullname: currentUser.fullname,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture || "",
        role: currentUser.role,
        verified: currentUser.verified === true,
      },

      [otherUser.uid]: {
        fullname: otherUser.fullname,
        username: otherUser.username,
        profilePicture: otherUser.profilePicture || "",
        role: otherUser.role,
        verified: otherUser.verified === true,
      },
    },

    lastMessage: "",
    lastMessageSender: "",
    lastMessageAt: null,

    unreadCount: {
      [currentUser.uid]: 0,
      [otherUser.uid]: 0,
    },

    createdAt: serverTimestamp(),
  });

  return conversationId;
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

/*
 * ============================================================
 * BACKEND API WRAPPERS
 *
 * Migrated to Express backend. The Firebase functions above are
 * preserved as rollback implementations.
 * ============================================================
 */

/**
 * Get a conversation by ID from the backend API.
 * Verifies the authenticated user is a participant.
 */
export async function apiGetConversationById(conversationId) {
  const response = await apiRequest(`/conversations/${conversationId}`);
  return response.data;
}

/**
 * Find an existing conversation or create a new one via the backend API.
 *
 * The backend retrieves authoritative participant information from
 * Firestore, preventing client-side spoofing of participant data.
 *
 * Uses the deterministic ID strategy so duplicate conversations
 * cannot be created for the same pair of users.
 *
 * @param {string} otherUserId - The other user's UID.
 * @param {object} options
 * @param {boolean} [options.findOnly=false] - If true, returns null instead
 *   of creating a conversation when none exists.
 */
export async function apiFindOrCreateConversation(otherUserId, { findOnly = false } = {}) {
  const response = await apiRequest("/conversations", {
    method: "POST",
    body: JSON.stringify({ otherUserId, findOnly }),
  });
  return response.data;
}

/**
 * Mark a conversation as read via the backend API.
 * Only updates the authenticated user's read/unread fields.
 */
export async function apiMarkConversationRead(conversationId) {
  const response = await apiRequest(`/conversations/${conversationId}/read`, {
    method: "PATCH",
  });
  return response.data;
}
