import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import { useAuth } from "./AuthContext";
import { subscribeUserConversations } from "../services/conversation.service";
import { getUserProfile } from "../services/user.service";
import {
  getCachedUserProfile,
  setCachedUserProfile,
} from "../utils/userProfileCache";
import { decrypt, getConversationKey } from "../services/encryption";

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
  const decryptedCacheRef = useRef(new Map());
  const decryptingRef = useRef(false);

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

  // Decrypt last messages for conversation list preview
  useEffect(() => {
    if (!profile?.uid || conversations.length === 0) return;

    let cancelled = false;

    async function decryptLastMessages() {
      if (decryptingRef.current) return;
      decryptingRef.current = true;

      const messagesRef = collection(db, "messages");

      try {
        const toFetch = conversations.filter((c) => {
          if (!c.lastMessageAt) return false;
          const ts =
            typeof c.lastMessageAt === "number"
              ? c.lastMessageAt
              : c.lastMessageAt?.seconds * 1000 || 0;
          const cached = decryptedCacheRef.current.get(c.id);
          return !cached || cached.ts !== ts;
        });

        if (toFetch.length === 0) {
          decryptingRef.current = false;
          return;
        }

        const results = new Map();

        for (const conv of toFetch) {
          if (cancelled) break;

          try {
            const q = query(
              messagesRef,
              where("conversationId", "==", conv.id),
              orderBy("createdAt", "desc"),
              limit(1),
            );
            const snap = await getDocs(q);
            if (snap.empty) continue;

            const msg = snap.docs[0].data();
            if (!msg.encryptionVersion) continue;

            const senderId = msg.senderId;
            const receiverId = conv.participants?.find(
              (p) => p !== senderId,
            );
            if (!senderId || !receiverId) continue;

            const key = await getConversationKey(
              receiverId,
              senderId,
              conv.id,
            );
            const text = await decrypt(msg.ciphertext, msg.iv, key);

            const ts =
              typeof conv.lastMessageAt === "number"
                ? conv.lastMessageAt
                : conv.lastMessageAt?.seconds * 1000 || 0;
            decryptedCacheRef.current.set(conv.id, { text, ts });
            results.set(conv.id, text);
          } catch {
            // Skip failed decryption
          }
        }

        if (!cancelled && results.size > 0) {
          setConversations((prev) =>
            prev.map((c) => {
              const text = results.get(c.id);
              return text !== undefined
                ? { ...c, lastMessageDecrypted: text }
                : c;
            }),
          );
        }
      } finally {
        decryptingRef.current = false;
      }
    }

    decryptLastMessages();

    return () => {
      cancelled = true;
    };
  }, [profile?.uid, conversations]);

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
