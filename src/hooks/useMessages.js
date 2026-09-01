import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  getConversation,
  findConversation,
} from "../services/conversation.service";

import { getUserProfile } from "../services/user.service";

import {
  getCachedUserProfile,
  setCachedUserProfile,
} from "../utils/userProfileCache";

import useOnlineStatus from "./messages/useOnlineStatus";
import useDrafts from "./messages/useDrafts";
import useConversationList from "./messages/useConversationList";
import useUserSearch from "./messages/useUserSearch";
import useMessageSubscription from "./messages/useMessageSubscription";
import useMessageActions from "./messages/useMessageActions";
import useInquiryFlow from "./messages/useInquiryFlow";

export default function useMessages() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeConversation, setActiveConversation] = useState(null);
  const [activeUser, setActiveUser] = useState(null);

  const currentTargetKey = useMemo(() => {
    if (activeConversation?.id) return activeConversation.id;
    if (activeUser?.uid) return `user_${activeUser.uid}`;
    return null;
  }, [activeConversation?.id, activeUser?.uid]);

  const isOnline = useOnlineStatus();
  const { message, setMessage, drafts, clearCurrentDraft } =
    useDrafts(currentTargetKey);
  const { conversations, loading } = useConversationList(profile?.uid);
  const {
    search,
    setSearch,
    userResults,
    searching,
  } = useUserSearch(profile?.uid, conversations);
  const {
    messages,
    loadingMessages,
    hasMoreOlder,
    loadingOlder,
    loadOlderMessages,
  } = useMessageSubscription(profile?.uid, activeConversation?.id);

  const {
    failedMessages,
    uploadingImage,
    sendMessage: sendAction,
    retryMessage,
    deleteFailedMessage,
  } = useMessageActions({
    profile,
    activeConversation,
    activeUser,
    setActiveConversation,
    setActiveUser,
    setSearchParams,
    message,
    clearCurrentDraft,
  });

  const {
    inquiryProduct,
    inquiryProducts,
    loadInquiryProducts,
    sendInquiry,
    acceptInquiry,
    cancelInquiryProduct,
  } = useInquiryFlow({
    profile,
    activeConversation,
    activeUser,
    setActiveConversation,
    setActiveUser,
    setSearchParams,
  });

  const [selectedImage, setSelectedImage] = useState(null);

  const sendMessage = useCallback(
    (customImage) => {
      sendAction(customImage || selectedImage);
      setSelectedImage(null);
    },
    [sendAction, selectedImage],
  );

  /*
   * ==================================================
   * HANDLE URL STATE
   *
   * /messages?conversation=id
   * /messages?user=uid
   * ==================================================
   */

  useEffect(() => {
    if (!profile?.uid) return;

    const conversationId = searchParams.get("conversation");
    const userId = searchParams.get("user");

    let cancelled = false;

    async function loadConversation() {
      if (conversationId) {
        try {
          const existing = conversations.find(
            (c) => c.id === conversationId,
          );

          if (existing) {
            if (!cancelled) {
              setActiveConversation(existing);
              setActiveUser(null);
            }
            return;
          }

          const conversation = await getConversation(conversationId);

          if (cancelled) return;

          if (!conversation) {
            setActiveConversation(null);
            setActiveUser(null);
            return;
          }

          const otherUid = conversation.participants?.find(
            (uid) => uid !== profile.uid,
          );

          if (!otherUid) {
            setActiveConversation(null);
            setActiveUser(null);
            return;
          }

          const otherUser =
            conversation.participantInfo?.[otherUid] || {};

          const cachedProfile = otherUid
            ? getCachedUserProfile(otherUid)
            : null;

          if (!cachedProfile?.profilePicture && otherUid) {
            getUserProfile(otherUid)
              .then((freshUser) => {
                if (freshUser && !cancelled) {
                  setCachedUserProfile(otherUid, freshUser);
                  setActiveConversation((prev) =>
                    prev &&
                    (prev.id === conversation.id ||
                      prev.otherUser?.uid === otherUid)
                      ? {
                          ...prev,
                          otherUser: {
                            ...prev.otherUser,
                            ...freshUser,
                            profilePicture:
                              freshUser.profilePicture ||
                              prev.otherUser?.profilePicture ||
                              "",
                            verified: freshUser.verified === true,
                          },
                        }
                      : prev,
                  );
                }
              })
              .catch(() => {});
          }

          setActiveConversation({
            ...conversation,
            otherUser: {
              uid: otherUid,
              ...otherUser,
              ...(cachedProfile || {}),
              profilePicture:
                cachedProfile?.profilePicture ||
                otherUser.profilePicture ||
                "",
              verified:
                cachedProfile?.verified ??
                otherUser.verified === true,
            },
          });

          setActiveUser(null);
        } catch (error) {
          if (!cancelled) {
            console.error("Failed to load conversation:", error);
            setActiveConversation(null);
            setActiveUser(null);
          }
        }
        return;
      }

      if (userId) {
        try {
          const initialCachedUser = getCachedUserProfile(userId);
          if (initialCachedUser) {
            setActiveUser(initialCachedUser);
          }

          const existingInState = conversations.find((c) =>
            c.participants?.includes(userId),
          );

          if (existingInState) {
            setSearchParams(
              { conversation: existingInState.id },
              { replace: true },
            );
            return;
          }

          const existingConversation = await findConversation(
            profile.uid,
            userId,
          );

          if (cancelled) return;

          if (existingConversation) {
            setSearchParams(
              { conversation: existingConversation.id },
              { replace: true },
            );
            return;
          }

          const user = await getUserProfile(userId);

          if (cancelled) return;

          if (!user) {
            setActiveConversation(null);
            setActiveUser(null);
            return;
          }

          setActiveConversation(null);
          setActiveUser(user);
        } catch (error) {
          if (!cancelled) {
            console.error("Failed to load user:", error);
            setActiveConversation(null);
            setActiveUser(null);
          }
        }
        return;
      }

      setActiveConversation(null);
      setActiveUser(null);
    }

    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [profile?.uid, searchParams, setSearchParams, conversations]);

  /*
   * ==================================================
   * SYNC INQUIRY PRODUCTS FROM MESSAGES
   * ==================================================
   */

  useEffect(() => {
    loadInquiryProducts(messages);
  }, [messages, loadInquiryProducts]);

  /*
   * ==================================================
   * SELECT CONVERSATION / USER
   * ==================================================
   */

  function selectConversation(conversation) {
    setSearch("");
    setSearchParams({ conversation: conversation.id });
  }

  function selectUser(user) {
    setSearch("");
    setSearchParams({ user: user.uid });
  }

  /*
   * ==================================================
   * FILTERED & LIVE CONVERSATIONS
   * ==================================================
   */

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;

    const keyword = search.toLowerCase();

    return conversations.filter(
      ({ otherUser }) =>
        otherUser?.fullname?.toLowerCase().includes(keyword) ||
        otherUser?.username?.toLowerCase().includes(keyword),
    );
  }, [conversations, search]);

  const activeConversationLive = useMemo(() => {
    if (!activeConversation?.id) return activeConversation;

    const found = conversations.find(
      (c) => c.id === activeConversation.id,
    );

    if (!found) return activeConversation;

    return {
      ...activeConversation,
      ...found,
      otherUser: found.otherUser || activeConversation.otherUser,
    };
  }, [activeConversation, conversations]);

  const combinedMessages = useMemo(() => {
    const targetConversationId = activeConversation?.id;

    const currentFailed = failedMessages.filter(
      (m) =>
        (targetConversationId &&
          m.conversationId === targetConversationId) ||
        (m.conversationId === "temp" && Boolean(activeUser)),
    );

    return [...messages, ...currentFailed];
  }, [
    messages,
    failedMessages,
    activeConversation?.id,
    activeUser,
  ]);

  return {
    loading,
    searching,
    conversations,
    filteredConversations,
    userResults,
    activeConversation: activeConversationLive,
    activeUser,
    messages: combinedMessages,
    loadingMessages,
    hasMoreOlder,
    loadingOlder,
    loadOlderMessages,
    inquiryProduct,
    inquiryProducts,
    cancelInquiryProduct,
    sendInquiry,
    acceptInquiry,
    search,
    setSearch,
    message,
    setMessage,
    selectedImage,
    setSelectedImage,
    uploadingImage,
    drafts,
    isOnline,
    selectConversation,
    selectUser,
    sendMessage,
    retryMessage,
    deleteFailedMessage,
  };
}
