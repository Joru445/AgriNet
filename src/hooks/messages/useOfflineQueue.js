import { useState, useCallback, useEffect, useRef } from "react";

const STORAGE_KEY = "agrinet_offline_queue";

/**
 * Persists failed messages to localStorage so they survive page refreshes.
 *
 * When the user comes back online, queued messages can be retried.
 * Image messages with blob URLs are excluded (the blob is gone after refresh).
 */
export default function useOfflineQueue() {
  const [queuedMessages, setQueuedMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveTimeoutRef = useRef(null);

  // Debounced save to localStorage
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        // Filter out messages with blob URLs (can't retry those after refresh)
        const retryable = queuedMessages.filter(
          (m) => !m.imageUrl?.startsWith("blob:"),
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(retryable));
      } catch {
        // localStorage full or unavailable
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [queuedMessages]);

  const enqueueMessage = useCallback((failedMessage) => {
    setQueuedMessages((prev) => [...prev, failedMessage]);
  }, []);

  const removeMessage = useCallback((id) => {
    setQueuedMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueuedMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const getRetryableMessages = useCallback(() => {
    // Only return messages that don't have blob URLs (those can't be retried)
    return queuedMessages.filter((m) => !m.imageUrl?.startsWith("blob:"));
  }, [queuedMessages]);

  return {
    queuedMessages,
    enqueueMessage,
    removeMessage,
    clearQueue,
    getRetryableMessages,
  };
}
