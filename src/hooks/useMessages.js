import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  markConversationRead,
  createConversation,
  findConversation,
  getConversation,
  subscribeUserConversations,
} from "../services/conversation.service";

import { subscribeMessages, sendMessage } from "../services/message.service";

import { getUserProfile, searchUsers } from "../services/user.service";

import { showToast } from "../utils/toast";

export default function useMessages() {
  const { profile } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);

  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  const [activeConversation, setActiveConversation] = useState(null);
  const [activeUser, setActiveUser] = useState(null);

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const searching = search.trim().length > 0;

  const [userResults, setUserResults] = useState([]);

  // Realtime conversations
  useEffect(() => {
    if (!profile?.uid) return;

    const unsubscribe = subscribeUserConversations(profile.uid, (data) => {
      const mapped = data.map((conversation) => {
        const otherUid = conversation.participants.find(
          (id) => id !== profile.uid,
        );

        return {
          ...conversation,
          otherUser: {
            uid: otherUid,
            ...(conversation.participantInfo?.[otherUid] || {}),
          },
          unreadCount: conversation.unreadCount?.[profile.uid] ?? 0,
        };
      });

      setConversations(mapped);
      setLoading(false);
    });

    return unsubscribe;
  }, [profile?.uid]);

  // Search users
  useEffect(() => {
    if (!profile?.uid) return;

    async function loadSearch() {
      if (!search.trim()) {
        setUserResults([]);
        return;
      }

      try {
        const users = await searchUsers(search, profile.uid);

        const conversationUserIds = new Set(
          conversations.map((conversation) => conversation.otherUser.uid),
        );

        setUserResults(
          users.filter((user) => !conversationUserIds.has(user.uid)),
        );
      } catch (error) {
        console.error(error);
      }
    }

    loadSearch();
  }, [search, conversations, profile?.uid]);

  // Read URL params
  useEffect(() => {
    if (!profile?.uid) return;

    const conversationId = searchParams.get("conversation");
    const userId = searchParams.get("user");

    if (conversationId) {
      getConversation(conversationId).then((conversation) => {
        if (!conversation) return;

        const otherUid = conversation.participants.find(
          (id) => id !== profile.uid,
        );

        setActiveConversation({
          ...conversation,
          otherUser: {
            uid: otherUid,
            ...(conversation.participantInfo?.[otherUid] || {}),
          },
        });

        setActiveUser(null);
      });

      return;
    }

    if (userId) {
      getUserProfile(userId).then((user) => {
        setActiveConversation(null);
        setActiveUser(user);
      });

      return;
    }

    setActiveConversation(null);
    setActiveUser(null);
  }, [searchParams, profile?.uid]);

  // Realtime messages + mark as read
  useEffect(() => {
    if (!activeConversation || !profile?.uid) {
      setMessages([]);
      return;
    }

    markConversationRead(activeConversation.id, profile.uid);

    return subscribeMessages(activeConversation.id, setMessages);
  }, [activeConversation?.id, profile?.uid]);

  async function selectConversation(conversation) {
    setSearch("");

    setSearchParams({
      conversation: conversation.id,
    });
  }

  async function selectUser(user) {
    setSearch("");

    const existing = await findConversation(profile.uid, user.uid);

    if (existing) {
      setSearchParams({
        conversation: existing.id,
      });

      return;
    }

    setSearchParams({
      user: user.uid,
    });
  }

  async function handleSend() {
    const text = message.trim();

    if (!text) return;

    try {
      let conversationId = activeConversation?.id;

      if (!conversationId) {
        conversationId = await createConversation(profile, activeUser);

        setSearchParams({
          conversation: conversationId,
        });
      }

      await sendMessage({
        conversationId,
        senderId: profile.uid,
        text,
      });

      setMessage("");
    } catch (error) {
      console.error(error);
      showToast.error(error.message);
    }
  }

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;

    const keyword = search.toLowerCase();

    return conversations.filter(({ otherUser }) => {
      return (
        otherUser.fullname?.toLowerCase().includes(keyword) ||
        otherUser.username?.toLowerCase().includes(keyword)
      );
    });
  }, [conversations, search]);

  return {
    loading,

    searching,

    conversations,
    users,

    filteredConversations,
    userResults,

    activeConversation,
    activeUser,

    messages,

    search,
    setSearch,

    message,
    setMessage,

    selectConversation,
    selectUser,

    sendMessage: handleSend,
  };
}
