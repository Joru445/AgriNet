import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
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
function getConversationId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

/**
 * Mark a conversation as read for a specific user.
 */
export async function markConversationRead(conversationId, uid) {
  if (!conversationId || !uid) return;

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
 *
 * New conversations use a deterministic document ID, so this normally
 * requires only one document read.
 *
 * The legacy query is kept temporarily so conversations created before
 * this refactor can still be found.
 */
export async function findConversation(uid1, uid2) {
  const q = query(
    conversationsRef,
    where("participants", "array-contains", uid1),
  );

  const snapshot = await getDocs(q);

  for (const conversation of snapshot.docs) {
    const data = conversation.data();
    const participants = data.participants || [];

    if (
      participants.length === 2 &&
      participants.includes(uid1) &&
      participants.includes(uid2)
    ) {
      return {
        id: conversation.id,
        ...data,
      };
    }
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
