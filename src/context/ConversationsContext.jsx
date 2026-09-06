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
import {
  getCachedUserProfile,
  setCachedUserProfile,
} from "../utils/userProfileCache";

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
    if (!profile?.uid) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeUserConversations(profile.uid, (data) => {
      try {
        const missingProfileUids = [];

        const mapped = data.map((conversation) => {
          const otherUid = conversation.participants?.find(
            (p) => p !== profile.uid,
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
              verified:
                cachedProfile?.verified ??
                otherInfo.verified === true,
            },
            unreadCount: conversation.unreadCount?.[profile.uid] ?? 0,
            rawUnreadCount: conversation.unreadCount || {},
          };
        });

        setConversations(mapped);

        if (missingProfileUids.length > 0) {
          const uniqueMissing = [...new Set(missingProfileUids)];
          uniqueMissing.forEach(async (missingUid) => {
            try {
              const user = await getUserProfile(missingUid);
              if (user) {
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
                            verified: user.verified === true,
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
