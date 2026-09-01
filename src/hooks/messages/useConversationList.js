import { useState, useEffect, useRef } from "react";
import { subscribeUserConversations } from "../../services/conversation.service";
import { getUserProfile } from "../../services/user.service";
import {
  getCachedUserProfile,
  setCachedUserProfile,
} from "../../utils/userProfileCache";

export default function useConversationList(uid) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const userProfileCacheRef = useRef(new Map());

  useEffect(() => {
    if (!uid) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeUserConversations(uid, (data) => {
      try {
        const missingProfileUids = [];

        const mapped = data.map((conversation) => {
          const otherUid = conversation.participants?.find(
            (p) => p !== uid,
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
            unreadCount: conversation.unreadCount?.[uid] ?? 0,
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
  }, [uid]);

  return { conversations, loading, userProfileCacheRef };
}
