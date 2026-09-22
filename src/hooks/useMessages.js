import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { showToast } from "../utils/toast";

import { doc, onSnapshot } from "firebase/firestore";
import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

import {
  apiGetConversationById,
  apiFindOrCreateConversation,
  updateConversationEndedLocations,
} from "../services/conversation.service";
import { stopLiveLocation as apiStopLiveLocation } from "../services/message.service";
import {
  getPermanentlyEndedLocations,
  markLocationPermanentlyEnded,
} from "../utils/endedLocations";

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
import useLiveLocationTracker from "./messages/useLiveLocationTracker";

export default function useMessages() {
  const { profile } = useAuth();
  const { t } = useLanguage();
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
  const { conversations, loading } = useConversationList();
  const {
    search,
    setSearch,
    userResults,
    searching,
  } = useUserSearch(profile?.uid, conversations);

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
    isSending,
    sendMessage: sendAction,
    sendLocationMessage: sendLocationAction,
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

  const currentUid = profile?.uid || auth.currentUser?.uid;

  const {
    startTracking,
    stopTracking: trackerStopTracking,
    isTracking: isTrackingLocation,
    activeSession: activeLiveSession,
  } = useLiveLocationTracker(currentUid);

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

  const [replyTo, setReplyTo] = useState(null);
  const [locallyEndedIds, setLocallyEndedIds] = useState(() => getPermanentlyEndedLocations());
  const [conversationEndedLocations, setConversationEndedLocations] = useState({});
  const clearReply = useCallback(() => setReplyTo(null), []);

  // Real-time listener on active conversation document for ended locations
  useEffect(() => {
    const convId = activeConversation?.id;
    if (!convId) {
      setConversationEndedLocations({});
      return;
    }

    const convRef = doc(db, "conversations", convId);
    const unsubscribe = onSnapshot(
      convRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data?.endedLocations) {
            setConversationEndedLocations(data.endedLocations);
            // Sync to permanent local storage
            Object.keys(data.endedLocations).forEach((id) => {
              if (data.endedLocations[id]) {
                markLocationPermanentlyEnded(id);
              }
            });
          }
        }
      },
      (err) => {
        console.warn("[useMessages] onSnapshot for conversation doc error:", err);
      },
    );

    return () => unsubscribe();
  }, [activeConversation?.id]);

  // Clear pending reply when switching conversations
  useEffect(() => {
    clearReply();
  }, [currentTargetKey, clearReply]);

  const sendMessage = useCallback(
    (customImage) => {
      sendAction(customImage || selectedImage, replyTo);
      setSelectedImage(null);
      clearReply();
    },
    [sendAction, selectedImage, replyTo, clearReply],
  );

  const activeLocationMessages = useMemo(() => {
    if (!messages?.length || !currentUid) return [];
    const now = Date.now();
    const permanentlyEnded = getPermanentlyEndedLocations();
    const convEnded = {
      ...(activeConversationLive?.endedLocations || {}),
      ...conversationEndedLocations,
    };
    return messages.filter((m) => {
      if (!m.id || locallyEndedIds.has(m.id) || permanentlyEnded.has(m.id) || Boolean(convEnded[m.id])) return false;
      const mSender = m.senderId || m.sender?.uid;
      // Must be sent by the CURRENT user
      if (!mSender || mSender !== currentUid) return false;

      // Only active LIVE location messages count as running location
      const isLiveLocation =
        (m.type === "live_location" || m.locationType === "live_location") &&
        m.locationType !== "location";
      if (!isLiveLocation) return false;

      if (m.isEnded === true || Boolean(m.endedAt) || m.isLive === false) return false;
      if (!m.liveUntil || now >= Number(m.liveUntil)) return false;
      return true;
    });
  }, [
    messages,
    currentUid,
    locallyEndedIds,
    activeConversationLive?.endedLocations,
    conversationEndedLocations,
  ]);

  const hasActiveLiveLocation = Boolean(
    currentUid &&
      (activeLocationMessages.length > 0 ||
        (isTrackingLocation &&
          activeLiveSession?.userId === currentUid &&
          activeLiveSession?.messageId &&
          (!activeLiveSession?.conversationId ||
            activeLiveSession.conversationId === activeConversation?.id)))
  );

  const activeLiveMessageId =
    (currentUid && activeLocationMessages.length > 0
      ? activeLocationMessages[0].id
      : null) ||
    (currentUid &&
    activeLiveSession?.userId === currentUid &&
    activeLiveSession?.messageId
      ? activeLiveSession.messageId
      : null) ||
    null;

  const stopLiveLocation = useCallback(
    async (targetMessageId, explicitConvId = null) => {
      if (!currentUid) return;
      const idsToStop = new Set();

      // Only allow stopping messages sent by the current user
      if (targetMessageId && targetMessageId !== "undefined" && targetMessageId !== "null") {
        const found = messages.find((m) => m.id === targetMessageId);
        if (found) {
          const mSender = found?.senderId || found?.sender?.uid;
          if (mSender === currentUid) {
            idsToStop.add(targetMessageId);
          } else {
            console.warn("[useMessages] Denied stopping live location: message does not belong to current user", {
              targetMessageId,
              mSender,
              currentUid,
            });
            return;
          }
        } else if (
          activeLiveSession?.userId === currentUid &&
          activeLiveSession.messageId === targetMessageId
        ) {
          idsToStop.add(targetMessageId);
        }
      }

      if (
        activeLiveSession?.messageId &&
        activeLiveSession.messageId !== "undefined" &&
        activeLiveSession.messageId !== "null" &&
        activeLiveSession.userId === currentUid
      ) {
        idsToStop.add(activeLiveSession.messageId);
      }

      // Also stop all active location messages for this user in this conversation
      activeLocationMessages.forEach((m) => {
        const mSender = m.senderId || m.sender?.uid;
        if (m.id && mSender === currentUid) {
          idsToStop.add(m.id);
        }
      });

      if (idsToStop.size === 0) return;

      // Permanently mark all these IDs in localStorage
      idsToStop.forEach((id) => markLocationPermanentlyEnded(id));

      // Optimistically mark all these IDs as ended locally!
      setLocallyEndedIds((prev) => {
        const next = new Set(prev);
        idsToStop.forEach((id) => next.add(id));
        return next;
      });

      // Unconditionally stop GPS tracking & session storage
      await trackerStopTracking();

      const convId =
        explicitConvId ||
        activeConversationLive?.id ||
        activeConversation?.id ||
        activeLiveSession?.conversationId;

      // Real-time sync to conversation document for all participants
      if (convId && idsToStop.size > 0) {
        try {
          await updateConversationEndedLocations(convId, Array.from(idsToStop));
        } catch (convErr) {
          console.error("[useMessages] Failed to update conversation endedLocations:", convErr);
        }
      }

      // Mark all stopped in Firestore messages
      for (const id of idsToStop) {
        try {
          await apiStopLiveLocation(id, convId);
        } catch (err) {
          console.error("[useMessages] Error stopping location for message:", id, err);
        }
      }
    },
    [
      currentUid,
      messages,
      activeLiveSession?.messageId,
      activeLiveSession?.userId,
      activeLiveSession?.conversationId,
      activeLocationMessages,
      trackerStopTracking,
      activeConversationLive?.id,
      activeConversation?.id,
    ],
  );

  const sendLocation = useCallback(
    async ({ type, location, liveUntil, isLive }) => {
      if (hasActiveLiveLocation) {
        showToast.warning(
          t("messages.endLiveLocationToShareAnother") ||
            "Please end your active live location before sending another location."
        );
        return;
      }

      const result = await sendLocationAction({
        type,
        location,
        liveUntil,
        isLive,
        replyTo,
      });

      if (result?.messageId && type === "live_location" && liveUntil) {
        startTracking(result.messageId, liveUntil, result.conversationId);
      }

      clearReply();
    },
    [
      hasActiveLiveLocation,
      t,
      sendLocationAction,
      replyTo,
      startTracking,
      clearReply,
    ],
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

          const conversation = await apiGetConversationById(conversationId);

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
                            verificationStatus:
                              freshUser.verificationStatus ||
                              prev.otherUser?.verificationStatus ||
                              "not_applied",
                            verified:
                              freshUser.verificationStatus === "approved" ||
                              prev.otherUser?.verificationStatus === "approved" ||
                              freshUser.verified === true,
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
              verificationStatus:
                cachedProfile?.verificationStatus ||
                otherUser.verificationStatus ||
                "not_applied",
              verified:
                cachedProfile?.verificationStatus === "approved" ||
                otherUser.verificationStatus === "approved" ||
                (cachedProfile?.verified ??
                otherUser.verified === true),
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

          const existingConversation = await apiFindOrCreateConversation(
            userId,
            { findOnly: true },
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

  const combinedMessages = useMemo(() => {
    const targetConversationId = activeConversationLive?.id || activeConversation?.id;
    const permanentlyEnded = getPermanentlyEndedLocations();
    const convEnded = {
      ...(activeConversationLive?.endedLocations || {}),
      ...conversationEndedLocations,
    };

    const currentFailed = failedMessages.filter(
      (m) =>
        (targetConversationId &&
          m.conversationId === targetConversationId) ||
        (m.conversationId === "temp" && Boolean(activeUser)),
    );

    return [...messages, ...currentFailed].map((m) => {
      const isLocationMsg =
        Boolean(m.location) ||
        m.type === "location" ||
        m.type === "live_location" ||
        m.locationType === "location" ||
        m.locationType === "live_location";

      if (!isLocationMsg) return m;

      const isLiveType =
        (m.type === "live_location" ||
          m.locationType === "live_location" ||
          Boolean(m.liveUntil)) &&
        m.locationType !== "location";

      const isEndedInConv = Boolean(m.id && convEnded[m.id]);
      const isPermanentlyMarked = Boolean(
        m.id && (locallyEndedIds.has(m.id) || permanentlyEnded.has(m.id) || isEndedInConv)
      );
      const isExpired = Boolean(isLiveType && m.liveUntil && Date.now() >= Number(m.liveUntil));

      if (isPermanentlyMarked || isExpired || m.isEnded === true || m.isLive === false) {
        return {
          ...m,
          isLive: false,
          isEnded: true,
          endedAt: m.endedAt || Date.now(),
        };
      }
      return m;
    });
  }, [
    messages,
    failedMessages,
    activeConversationLive,
    activeConversation?.id,
    activeUser,
    locallyEndedIds,
    conversationEndedLocations,
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
    replyTo,
    setReplyTo,
    clearReply,
    selectedImage,
    setSelectedImage,
    uploadingImage,
    isSending,
    drafts,
    isOnline,
    selectConversation,
    selectUser,
    sendMessage,
    sendLocation,
    stopLiveLocation,
    isTrackingLocation,
    hasActiveLiveLocation,
    activeLiveMessageId,
    retryMessage,
    deleteFailedMessage,
  };
}
