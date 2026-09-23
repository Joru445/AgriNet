import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useConversationsContext } from "./ConversationsContext";
import { getTimestampMs } from "../utils/chat";

const UnreadMessagesContext = createContext({
  unreadCount: 0,
  showPopup: false,
});

export function UnreadMessagesProvider({ children }) {
  const { profile } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { conversations } = useConversationsContext();

  const [unreadCount, setUnreadCount] = useState(0);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const dismissedIdRef = useRef(null);
  const popupTimerRef = useRef(null);

  const activeConvId = searchParams.get("conversation");
  const activeUserId = searchParams.get("user");
  const isMessagesRoute = location.pathname.includes("messages");

  const recalculateUnreads = useCallback(() => {
    if (!profile?.uid || !conversations) {
      setUnreadCount(0);
      setTotalUnreadMessages(0);
      setShowPopup(false);
      return;
    }

    let totalUnread = 0;
    const unreadConversations = [];

    conversations.forEach((conv) => {
      const isCurrentActive =
        isMessagesRoute &&
        ((activeConvId && conv.id === activeConvId) ||
          (activeUserId && conv.participants?.includes(activeUserId)));

      if (!isCurrentActive) {
        let count = 0;
        if (typeof conv.unreadCount === "number") {
          count = conv.lastMessageSender !== profile.uid ? conv.unreadCount : 0;
        } else if (
          conv.unreadCount &&
          typeof conv.unreadCount === "object" &&
          profile.uid in conv.unreadCount
        ) {
          count = Number(conv.unreadCount[profile.uid]) || 0;
        } else if (conv[`unreadCount.${profile.uid}`] != null) {
          count = Number(conv[`unreadCount.${profile.uid}`]) || 0;
        } else if (
          conv.rawUnreadCount &&
          typeof conv.rawUnreadCount === "object" &&
          profile.uid in conv.rawUnreadCount
        ) {
          count = Number(conv.rawUnreadCount[profile.uid]) || 0;
        }

        const isFromMe = Boolean(
          conv.lastMessageSender === profile.uid ||
          (typeof conv.lastMessage === "string" &&
            conv.lastMessage.startsWith("You:"))
        );
        if (!isFromMe && (conv.lastMessageAt || conv.lastMessage)) {
          const myLastRead = conv.lastRead?.[profile.uid];
          const readMs = getTimestampMs(myLastRead);
          const msgMs = getTimestampMs(conv.lastMessageAt);
          if (!readMs || (msgMs && msgMs > readMs)) {
            if (count <= 0) {
              count = 1;
            }
          }
        }

        if (count > 0) {
          totalUnread += count;
          unreadConversations.push(conv);
        }
      }
    });

    // The messages icon badge count is based on each user/conversation that has chat:
    // "it will be based on each user have chat if 6 user have chat it will be 6 be flexible"
    const unreadUsersCount = unreadConversations.length;
    setUnreadCount(unreadUsersCount);
    setTotalUnreadMessages(totalUnread);

    if (unreadUsersCount === 0 || unreadConversations.length === 0) {
      setShowPopup(false);
      dismissedIdRef.current = null;
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
      return;
    }

    const newestUnread = unreadConversations[0];
    const lastTime =
      newestUnread.lastMessageAt?.seconds ||
      (newestUnread.lastMessageAt?.toMillis
        ? newestUnread.lastMessageAt.toMillis()
        : newestUnread.lastMessage || "latest");
    const popupId = `${newestUnread.id}_${lastTime}`;

    if (dismissedIdRef.current !== popupId) {
      dismissedIdRef.current = popupId;
      setShowPopup(true);

      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }

      popupTimerRef.current = setTimeout(() => {
        setShowPopup(false);
      }, 5000);
    }
  }, [profile?.uid, conversations, isMessagesRoute, activeConvId, activeUserId]);

  const recalculateUnreadsRef = useRef(recalculateUnreads);

  useEffect(() => {
    recalculateUnreadsRef.current = recalculateUnreads;
  });

  useEffect(() => {
    recalculateUnreads();
  }, [recalculateUnreads]);

  useEffect(() => {
    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, []);

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadCount,
        unreadUsersCount: unreadCount,
        totalUnreadMessages,
        showPopup,
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUnreadMessages() {
  return useContext(UnreadMessagesContext);
}
