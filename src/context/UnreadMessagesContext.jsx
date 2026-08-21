import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { subscribeUserConversations } from "../services/conversation.service";

const UnreadMessagesContext = createContext({
  unreadCount: 0,
  showPopup: false,
});

export function UnreadMessagesProvider({ children }) {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const dismissedIdRef = useRef(null);
  const popupTimerRef = useRef(null);

  useEffect(() => {
    if (!profile?.uid) {
      setUnreadCount(0);
      setShowPopup(false);
      dismissedIdRef.current = null;
      return;
    }

    const unsubscribe = subscribeUserConversations(
      profile.uid,
      (conversations) => {
        let totalUnread = 0;
        const unreads = [];

        conversations.forEach((conv) => {
          const count = conv.unreadCount?.[profile.uid] ?? 0;
          if (count > 0) {
            totalUnread += count;
            unreads.push(conv);
          }
        });

        setUnreadCount(totalUnread);

        // Clear popup if no unread messages remain
        if (totalUnread === 0) {
          setShowPopup(false);
          dismissedIdRef.current = null;
          if (popupTimerRef.current) {
            clearTimeout(popupTimerRef.current);
          }
          return;
        }

        // Show popup for the newest unread conversation
        if (unreads.length > 0) {
          const newestUnread = unreads[0];
          const popupId = `${newestUnread.id}_${newestUnread.lastMessageAt?.seconds || Date.now()}`;

          // Only trigger popup if this specific message has not been shown yet
          if (dismissedIdRef.current !== popupId) {
            dismissedIdRef.current = popupId;
            setShowPopup(true);

            if (popupTimerRef.current) {
              clearTimeout(popupTimerRef.current);
            }

            // Speech bubble auto-dismisses after 5 seconds
            popupTimerRef.current = setTimeout(() => {
              setShowPopup(false);
            }, 5000);
          }
        }
      },
    );

    return () => {
      unsubscribe();
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, [profile?.uid]);

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadCount,
        showPopup,
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  return useContext(UnreadMessagesContext);
}
