import { useState, useEffect, useRef, useCallback } from "react";
import {
  subscribeMessages,
  fetchOlderMessages,
  DEFAULT_MESSAGE_LIMIT,
} from "../../services/message.service";
import { markConversationRead } from "../../services/conversation.service";
import { sortByCreatedAt } from "../../utils/messaging/sortMessages";

export default function useMessageSubscription(uid, conversationId) {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const oldestDocSnapRef = useRef(null);
  const messagesMapRef = useRef(new Map());

  useEffect(() => {
    if (!uid || !conversationId) {
      setMessages([]);
      setLoadingMessages(false);
      setHasMoreOlder(false);
      setLoadingOlder(false);
      oldestDocSnapRef.current = null;
      messagesMapRef.current.clear();
      return;
    }

    setMessages([]);
    setLoadingMessages(true);
    setHasMoreOlder(false);
    setLoadingOlder(false);
    oldestDocSnapRef.current = null;
    messagesMapRef.current.clear();

    const unsubscribe = subscribeMessages(
      conversationId,
      (incomingMessages, meta) => {
        setLoadingMessages(false);

        if (!oldestDocSnapRef.current && meta?.oldestDocSnapshot) {
          oldestDocSnapRef.current = meta.oldestDocSnapshot;
          setHasMoreOlder(meta.hasMore);
        }

        incomingMessages.forEach((msg) => {
          messagesMapRef.current.set(msg.id, msg);
        });

        const sorted = Array.from(
          messagesMapRef.current.values(),
        ).sort(sortByCreatedAt);

        setMessages(sorted);

        if (document.visibilityState === "visible") {
          const hasUnreadFromOther = incomingMessages.some(
            (m) => m.senderId !== uid && m.read !== true,
          );

          if (hasUnreadFromOther) {
            markConversationRead(conversationId, uid).catch((error) => {
              console.error(
                "Failed to mark conversation as read:",
                error,
              );
            });
          }
        }
      },
      DEFAULT_MESSAGE_LIMIT,
    );

    function handleVisibilityOrFocus() {
      if (document.visibilityState === "visible") {
        markConversationRead(conversationId, uid).catch((error) => {
          console.error(
            "Failed to mark conversation as read on focus:",
            error,
          );
        });
      }
    }

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      unsubscribe();
    };
  }, [uid, conversationId]);

  const loadOlderMessages = useCallback(async () => {
    if (
      loadingOlder ||
      !hasMoreOlder ||
      !oldestDocSnapRef.current ||
      !conversationId
    ) {
      return;
    }

    setLoadingOlder(true);

    try {
      const result = await fetchOlderMessages(
        conversationId,
        oldestDocSnapRef.current,
        DEFAULT_MESSAGE_LIMIT,
      );

      if (result.messages && result.messages.length > 0) {
        result.messages.forEach((msg) => {
          messagesMapRef.current.set(msg.id, msg);
        });

        oldestDocSnapRef.current = result.oldestDocSnapshot;
        setHasMoreOlder(result.hasMore);

        const sorted = Array.from(
          messagesMapRef.current.values(),
        ).sort(sortByCreatedAt);

        setMessages(sorted);
      } else {
        setHasMoreOlder(false);
      }
    } catch (error) {
      console.error("Failed to load older messages:", error);
    } finally {
      setLoadingOlder(false);
    }
  }, [loadingOlder, hasMoreOlder, conversationId]);

  return {
    messages,
    loadingMessages,
    hasMoreOlder,
    loadingOlder,
    loadOlderMessages,
  };
}
