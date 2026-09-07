import { useState, useEffect, useRef, useCallback } from "react";
import {
  subscribeMessages,
  apiGetMessages,
  DEFAULT_MESSAGE_LIMIT,
} from "../../services/message.service";
import { apiMarkConversationRead } from "../../services/conversation.service";
import { sortByCreatedAt } from "../../utils/messaging/sortMessages";

function toCreatedAtMs(value) {
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value === "number") return value;
  if (value.seconds != null) return value.seconds * 1000;
  return null;
}

function encodeCursor(createdAtMs, docId) {
  const json = JSON.stringify({ c: createdAtMs, d: docId });
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export default function useMessageSubscription(uid, conversationId) {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const messagesMapRef = useRef(new Map());

  useEffect(() => {
    if (!uid || !conversationId) {
      setMessages([]);
      setLoadingMessages(false);
      setHasMoreOlder(false);
      setLoadingOlder(false);
      messagesMapRef.current.clear();
      return;
    }

    setMessages([]);
    setLoadingMessages(true);
    setHasMoreOlder(false);
    setLoadingOlder(false);
    messagesMapRef.current.clear();

    const unsubscribe = subscribeMessages(
      conversationId,
      (incomingMessages, meta) => {
        setLoadingMessages(false);
        setHasMoreOlder(meta.hasMore);

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
            apiMarkConversationRead(conversationId).catch((error) => {
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
        apiMarkConversationRead(conversationId).catch((error) => {
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
    if (loadingOlder || !hasMoreOlder || !conversationId) {
      return;
    }

    let oldest = null;
    let oldestMs = null;

    for (const msg of messagesMapRef.current.values()) {
      const ms = toCreatedAtMs(msg.createdAt);
      if (ms == null) continue;

      if (
        oldest === null ||
        ms < oldestMs ||
        (ms === oldestMs && msg.id < oldest.id)
      ) {
        oldest = msg;
        oldestMs = ms;
      }
    }

    if (!oldest) {
      setHasMoreOlder(false);
      return;
    }

    setLoadingOlder(true);

    try {
      const cursor = encodeCursor(oldestMs, oldest.id);

      const result = await apiGetMessages(conversationId, {
        cursor,
        limit: DEFAULT_MESSAGE_LIMIT,
      });

      if (result.messages && result.messages.length > 0) {
        // API returns newest-first; reverse for chronological order
        result.messages
          .slice()
          .reverse()
          .forEach((msg) => {
            messagesMapRef.current.set(msg.id, msg);
          });

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