import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  orderBy,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

const conversationsRef = collection(db, "conversations");

export async function markConversationRead(conversationId, uid) {
  await updateDoc(doc(db, "conversations", conversationId), {
    [`lastRead.${uid}`]: serverTimestamp(),
    [`unreadCount.${uid}`]: 0,
  });
}

export async function findConversation(uid1, uid2) {
  const q = query(
    conversationsRef,
    where("participants", "array-contains", uid1),
  );

  const snapshot = await getDocs(q);

  for (const conversation of snapshot.docs) {
    const participants = conversation.data().participants;

    if (
      participants.length === 2 &&
      participants.includes(uid1) &&
      participants.includes(uid2)
    ) {
      return {
        id: conversation.id,
        ...conversation.data(),
      };
    }
  }

  return null;
}

export async function createConversation(currentUser, otherUser) {
  const docRef = await addDoc(conversationsRef, {
    participants: [currentUser.uid, otherUser.uid],

    participantInfo: {
      [currentUser.uid]: {
        fullname: currentUser.fullname,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture || "",
        role: currentUser.role,
      },

      [otherUser.uid]: {
        fullname: otherUser.fullname,
        username: otherUser.username,
        profilePicture: otherUser.profilePicture || "",
        role: otherUser.role,
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

  return docRef.id;
}

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

export function subscribeUserConversations(uid, callback) {
  const q = query(
    conversationsRef,
    where("participants", "array-contains", uid),
    orderBy("lastMessageAt", "desc"),
  );

  return onSnapshot(
    q,
    (snapshot) => {

      callback(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    },
    (error) => {
      console.error("Conversation listener error:", error);
    },
  );
}

export async function updateConversation(conversationId, data) {
  const conversationRef = doc(db, "conversations", conversationId);

  await updateDoc(conversationRef, data);
}
