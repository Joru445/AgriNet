import { useState, useEffect, useRef, useCallback } from "react";
import {
  subscribeMessages,
  apiGetMessages,
  DEFAULT_MESSAGE_LIMIT,
} from "../../services/message.service";
import { apiMarkConversationRead } from "../../services/conversation.service";
import { sortByCreatedAt } from "../../utils/messaging/sortMessages";
import { getMessageCache, setMessageCache } from "../../utils/messaging/messageCache";

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
  const readRequestRef = useRef(null);
  const pendingReadRef = useRef(false);

  useEffect(() => {
    if (!uid || !conversationId) {
      setMessages([]);
      setLoadingMessages(false);
      setHasMoreOlder(false);
      setLoadingOlder(false);
      messagesMapRef.current.clear();
      return;
    }

    const cached = getMessageCache(uid, conversationId) || {
      map: new Map(),
      hasMore: false,
      cursor: null,
      hasLoadedOlder: false,
      recentIds: new Set(),
      markedNewest: null,
      lastSyncedAt: 0,
    };
    setMessageCache(uid, conversationId, cached);
    setMessages(Array.from(cached.map.values()).sort(sortByCreatedAt));
    setLoadingMessages(cached.map.size === 0);
    setHasMoreOlder(Boolean(cached.hasMore));
    setLoadingOlder(false);
    messagesMapRef.current = cached.map;

    const unsubscribe = subscribeMessages(
      conversationId,
      (incomingMessages, meta) => {
        setLoadingMessages(false);
        cached.lastSyncedAt = Date.now();
        if (meta?.fullSnapshot) {
          const incomingIds = new Set(incomingMessages.map((message) => message.id));
          cached.recentIds?.forEach((id) => {
            if (!incomingIds.has(id)) cached.map.delete(id);
          });
          cached.recentIds = incomingIds;
          if (!cached.cursor && !cached.hasLoadedOlder) {
            cached.map = new Map(incomingMessages.map((message) => [message.id, message]));
            messagesMapRef.current = cached.map;
          }
        }
        if (!cached.cursor) {
          cached.hasMore = Boolean(meta?.hasMore);
          setHasMoreOlder(cached.hasMore);
        }

        incomingMessages.forEach((msg) => {
          cached.map.set(msg.id, msg);
        });
        setMessageCache(uid, conversationId, cached);
        messagesMapRef.current = cached.map;

        const sorted = Array.from(
          messagesMapRef.current.values(),
        ).sort(sortByCreatedAt);

        setMessages(sorted);

        const incomingFromOther = sorted.filter((m) => m.senderId && m.senderId !== uid);
        const newestIncoming = incomingFromOther[incomingFromOther.length - 1];
        if (
          document.visibilityState === "visible" &&
          newestIncoming &&
          newestIncoming.id &&
          cached.markedNewest !== newestIncoming.id
        ) {
          const targetId = newestIncoming.id;
          const executeMarkRead = () => {
            readRequestRef.current = apiMarkConversationRead(conversationId)
              .then(() => {
                cached.markedNewest = targetId;
              })
              .catch((error) => {
                cached.markedNewest = null;
                console.error("Failed to mark conversation as read:", error);
              })
              .finally(() => {
                readRequestRef.current = null;
                if (pendingReadRef.current) {
                  pendingReadRef.current = false;
                  executeMarkRead();
                }
              });
          };

          if (readRequestRef.current) {
            pendingReadRef.current = true;
          } else {
            executeMarkRead();
          }
        }
      },
      DEFAULT_MESSAGE_LIMIT,
      (error) => {
        if (error?.code === "SESSION_REVOKED" || error?.code === "SESSION_BINDING_MISMATCH") return;
        if (cached.map.size === 0) setLoadingMessages(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [uid, conversationId]);

  useEffect(() => {
    if (!conversationId || !uid) return;

    const onVisible = () => {
      if (document.visibilityState === "visible" && conversationId) {
        apiMarkConversationRead(conversationId).catch(() => {});
      }
    };

    if (document.visibilityState === "visible") {
      onVisible();
    }

    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [conversationId, uid]);

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
    const cached = getMessageCache(uid, conversationId) || {
      map: messagesMapRef.current,
      hasMore: hasMoreOlder,
      cursor: null,
      hasLoadedOlder: false,
      recentIds: new Set(),
      markedNewest: null,
      lastSyncedAt: 0,
    };
    setMessageCache(uid, conversationId, cached);

    try {
      const cursor = cached.cursor || encodeCursor(oldestMs, oldest.id);

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
            cached.map.set(msg.id, msg);
          });

        cached.hasMore = Boolean(result.hasMore);
        cached.cursor = result.cursor || null;
        cached.hasLoadedOlder = true;
        setMessageCache(uid, conversationId, cached);
        messagesMapRef.current = cached.map;
        setHasMoreOlder(cached.hasMore);

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
  }, [loadingOlder, hasMoreOlder, conversationId, uid]);

  return {
    messages,
    loadingMessages,
    hasMoreOlder,
    loadingOlder,
    loadOlderMessages,
  };
}
