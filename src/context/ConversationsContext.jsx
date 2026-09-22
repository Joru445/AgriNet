import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { subscribeUserConversations } from "../services/conversation.service";
import { getUserProfile } from "../services/user.service";
import { getCachedUserProfile, setCachedUserProfile } from "../utils/userProfileCache";
import { getTimestampMs } from "../utils/chat";

const ConversationsContext = createContext({
  conversations: [],
  loading: true,
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
  const { profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const userProfileCacheRef = useRef(new Map());

  useEffect(() => {
    // Always clear stale data when the effect re-runs (UID change or mount).
    // Prevents previous account's conversations from flashing while the new
    // subscription is loading.
    setConversations([]);
    setLoading(true);

    if (!profile?.uid) {
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
          let hasExplicitUnread = false;

          if (typeof conversation.unreadCount === "number") {
            unread = conversation.lastMessageSender !== listenerUid ? conversation.unreadCount : 0;
            hasExplicitUnread = true;
          } else if (conversation.unreadCount && typeof conversation.unreadCount === "object" && listenerUid in conversation.unreadCount) {
            unread = Number(conversation.unreadCount[listenerUid]) || 0;
            hasExplicitUnread = true;
          } else if (conversation.rawUnreadCount && typeof conversation.rawUnreadCount === "object" && listenerUid in conversation.rawUnreadCount) {
            unread = Number(conversation.rawUnreadCount[listenerUid]) || 0;
            hasExplicitUnread = true;
          }

          // Fallback ONLY when unreadCount field is completely missing from document
          if (!hasExplicitUnread) {
            const isFromOther = Boolean(conversation.lastMessageSender && conversation.lastMessageSender !== listenerUid);
            if (isFromOther && conversation.lastMessageAt) {
              const myLastRead = conversation.lastRead?.[listenerUid];
              const readMs = getTimestampMs(myLastRead);
              const msgMs = getTimestampMs(conversation.lastMessageAt);
              if (!readMs || (msgMs && msgMs > readMs)) {
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

        setConversations(mapped);

        if (missingProfileUids.length > 0) {
          const uniqueMissing = [...new Set(missingProfileUids)];
          uniqueMissing.forEach(async (missingUid) => {
            try {
              const user = await getUserProfile(missingUid);
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
  }, [profile?.uid]);

  return (
    <ConversationsContext.Provider value={{ conversations, loading }}>
      {children}
    </ConversationsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConversationsContext() {
  return useContext(ConversationsContext);
}
