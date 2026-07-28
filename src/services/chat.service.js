import {
  createConversation,
  findConversation,
  updateConversation,
} from "./conversation.service";

import { sendMessage } from "./message.service";

import { increment, serverTimestamp } from "firebase/firestore";

/**
 * Start or retrieve a conversation.
 */
export async function startConversation(currentUser, otherUser) {
  const existing = await findConversation(currentUser.uid, otherUser.uid);

  if (existing) {
    return existing.id;
  }

  return createConversation(currentUser, otherUser);
}

/**
 * Send a chat message.
 */
export async function sendChatMessage(
  conversation,
  senderId,
  receiverId,
  text,
) {
  const trimmed = text.trim();

  if (!trimmed) return;

  await sendMessage(conversation.id, senderId, trimmed);

  await updateConversation(conversation.id, {
    lastMessage: trimmed,
    lastMessageSender: senderId,
    lastMessageAt: serverTimestamp(),

    [`unreadCount.${receiverId}`]: increment(1),
  });
}
