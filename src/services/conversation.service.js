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
  if (!conversationId || !uid) return;

  // Skip redundant write if unreadCount is already known to be 0
  if (currentUnreadCount === 0) {
    return;
  }

  try {
    const conversationRef = doc(db, "conversations", conversationId);
    await updateDoc(conversationRef, {
      [`lastRead.${uid}`]: serverTimestamp(),
      [`unreadCount.${uid}`]: 0,
    });
  } catch (error) {
    console.error("Failed to mark conversation read:", error);
  }
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
