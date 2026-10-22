import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { subscribeUserConversations, apiMarkConversationRead } from "../services/conversation.service";
import { getUserProfile } from "../services/user.service";
import { getCachedUserProfile, setCachedUserProfile } from "../utils/userProfileCache";
import { getTimestampMs } from "../utils/chat";

const conversationCache = new Map();
const profileRequests = new Map();
const MAX_ACCOUNT_CACHES = 4;

function touchConversationCache(uid, conversations) {
  conversationCache.delete(uid);
  conversationCache.set(uid, conversations);
  while (conversationCache.size > MAX_ACCOUNT_CACHES) conversationCache.delete(conversationCache.keys().next().value);
}

function sameConversationList(previous, next) {
  if (previous.length !== next.length) return false;
  return previous.every((item, index) => item.id === next[index].id && item.unreadCount === next[index].unreadCount && item.lastMessageAt === next[index].lastMessageAt);
}

const ConversationsContext = createContext({
  conversations: [],
  loading: true,
  refresh: () => {},
  markConversationReadLocally: () => {},
});

/**
 * Single onSnapshot subscription for the authenticated user's conversations.
 *
 * All consumers (useConversationList, useDashboard, UnreadMessagesContext,
 * Sidebar, BottomNavigation) share this one subscription instead of each
 * creating their own independent listener.
 *
 * Profile enrichment is performed here so downstream consumers receive
 * fully hydrated conversation objects without additional Firestore reads.
 */
export function ConversationsProvider({ children }) {
  const { profile, deviceSessionReady } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const userProfileCacheRef = useRef(new Map());
  const locallyReadTimestampsRef = useRef(new Map());

  const markConversationReadLocally = useCallback((conversationId) => {
    if (!conversationId || !profile?.uid) return;
    const now = Date.now();
    locallyReadTimestampsRef.current.set(conversationId, now);

    setConversations((prev) => {
      let changed = false;
      const next = prev.map((c) => {
        if (c.id !== conversationId) return c;
        if (c.unreadCount === 0 && (c.lastRead?.[profile.uid] || 0) >= now) return c;
        changed = true;
        return {
          ...c,
          unreadCount: 0,
          rawUnreadCount: {
            ...(typeof c.rawUnreadCount === "object" ? c.rawUnreadCount : {}),
            [profile.uid]: 0,
          },
          lastRead: {
            ...(typeof c.lastRead === "object" ? c.lastRead : {}),
            [profile.uid]: now,
          },
        };
      });
      if (changed) {
        touchConversationCache(profile.uid, next);
      }
      return changed ? next : prev;
    });

    apiMarkConversationRead(conversationId).catch((error) => {
      console.warn("apiMarkConversationRead failed:", error);
    });
  }, [profile?.uid]);

  useEffect(() => {
    // Always clear stale data when the effect re-runs (UID change or mount).
    // Prevents previous account's conversations from flashing while the new
    // subscription is loading.
    const cached = profile?.uid ? conversationCache.get(profile.uid) : null;
    setConversations(cached || []);
    setLoading(!cached);

    if (!profile?.uid || !deviceSessionReady) {
      setLoading(false);
      return;
    }

    const listenerUid = profile.uid;

    const unsubscribe = subscribeUserConversations(listenerUid, (data) => {
      // Guard: ignore if the authenticated user has changed since this
      // listener was created.
      if (profile?.uid !== listenerUid) return;

      try {
        const missingProfileUids = [];

        const mapped = data.map((conversation) => {
          const otherUid = conversation.participants?.find(
            (p) => p !== listenerUid,
          );

          const otherInfo = conversation.participantInfo?.[otherUid] || {};

          const cachedProfile = otherUid
            ? getCachedUserProfile(otherUid) ||
              userProfileCacheRef.current.get(otherUid)
            : null;

          const hasBasicInfo = Boolean(
            otherInfo.fullname || otherInfo.username,
          );
          const hasProfilePic = Boolean(
            cachedProfile?.profilePicture || otherInfo.profilePicture,
          );

          if ((!hasBasicInfo || !hasProfilePic) && otherUid) {
            missingProfileUids.push(otherUid);
          }

          let unread = 0;

          if (typeof conversation.unreadCount === "number") {
            unread = conversation.lastMessageSender !== listenerUid ? conversation.unreadCount : 0;
          } else if (
            conversation.unreadCount &&
            typeof conversation.unreadCount === "object" &&
            listenerUid in conversation.unreadCount
          ) {
            unread = Number(conversation.unreadCount[listenerUid]) || 0;
          } else if (conversation[`unreadCount.${listenerUid}`] != null) {
            unread = Number(conversation[`unreadCount.${listenerUid}`]) || 0;
          } else if (
            conversation.rawUnreadCount &&
            typeof conversation.rawUnreadCount === "object" &&
            listenerUid in conversation.rawUnreadCount
          ) {
            unread = Number(conversation.rawUnreadCount[listenerUid]) || 0;
          }

          // Resilient check: If last message was sent by the other party and is newer than our lastRead (or not yet read),
          // ensure unread is at least 1 even if the unreadCount field was 0, lagged, or missed an increment
          const isFromMe = Boolean(
            conversation.lastMessageSender === listenerUid ||
            (typeof conversation.lastMessage === "string" &&
              conversation.lastMessage.startsWith("You:"))
          );
          const localReadMs = locallyReadTimestampsRef.current.get(conversation.id) || 0;
          const myLastRead = conversation.lastRead?.[listenerUid];
          const readMs = Math.max(getTimestampMs(myLastRead) || 0, localReadMs);
          const msgMs = getTimestampMs(conversation.lastMessageAt);

          if (localReadMs > 0 && localReadMs >= (msgMs || 0)) {
            unread = 0;
          } else if (!isFromMe && (conversation.lastMessageAt || conversation.lastMessage)) {
            if (!readMs || (msgMs && msgMs > readMs)) {
              if (unread <= 0) {
                unread = 1;
              }
            }
          }

          return {
            ...conversation,
            otherUser: {
              uid: otherUid,
              ...otherInfo,
              ...(cachedProfile || {}),
              profilePicture:
                cachedProfile?.profilePicture ||
                otherInfo.profilePicture ||
                "",
              verificationStatus:
                cachedProfile?.verificationStatus ||
                otherInfo.verificationStatus ||
                "not_applied",
              verified:
                cachedProfile?.verificationStatus === "approved" ||
                otherInfo.verificationStatus === "approved" ||
                (cachedProfile?.verified ??
                otherInfo.verified === true),
            },
            unreadCount: unread,
            rawUnreadCount: conversation.unreadCount || {},
          };
        });

        // Realtime payloads can be snapshots or individual updates. Merge by
        // stable conversation ID so an incremental event never discards the
        // already loaded account-scoped history.
        const byId = new Map((conversationCache.get(listenerUid) || []).map((item) => [item.id, item]));
        mapped.forEach((conversation) => byId.set(conversation.id, conversation));
        const merged = Array.from(byId.values()).sort((a, b) => getTimestampMs(b.lastMessageAt) - getTimestampMs(a.lastMessageAt));
        touchConversationCache(listenerUid, merged);
        setConversations((current) => sameConversationList(current, merged) ? current : merged);

        if (missingProfileUids.length > 0) {
          const uniqueMissing = [...new Set(missingProfileUids)];
          uniqueMissing.forEach(async (missingUid) => {
            try {
              let request = profileRequests.get(missingUid);
              if (!request) {
                request = getUserProfile(missingUid);
                profileRequests.set(missingUid, request);
                request.then(
                  () => profileRequests.delete(missingUid),
                  () => profileRequests.delete(missingUid),
                );
              }
              const user = await request;
              if (user && profile?.uid === listenerUid) {
                userProfileCacheRef.current.set(missingUid, user);
                setCachedUserProfile(missingUid, user);
                setConversations((prev) =>
                  prev.map((c) =>
                    c.otherUser?.uid === missingUid
                      ? {
                          ...c,
                          otherUser: {
                            ...c.otherUser,
                            ...user,
                            profilePicture:
                              user.profilePicture ||
                              c.otherUser?.profilePicture ||
                              "",
                            verificationStatus:
                              user.verificationStatus ||
                              c.otherUser?.verificationStatus ||
                              "not_applied",
                            verified:
                              user.verificationStatus === "approved" ||
                              c.otherUser?.verificationStatus === "approved" ||
                              user.verified === true,
                          },
                        }
                      : c,
                  ),
                );
              }
            } catch (error) {
              console.error(
                `Failed to load fallback user profile for ${missingUid}:`,
                error,
              );
            }
          });
        }
      } catch (error) {
        console.error("Failed to process conversations:", error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [profile?.uid, deviceSessionReady, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        loading,
        refresh,
        markConversationReadLocally,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConversationsContext() {
  return useContext(ConversationsContext);
}
