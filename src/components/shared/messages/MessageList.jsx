import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";

import { useAuth } from "../../../context/AuthContext";
import MessageBubble from "./MessageBubble";
import ProductInquiryMessage from "./ProductInquiryMessage";
import MessageSeparator from "./MessageSeparator";

import { shouldShowSeparator } from "../../../utils/chat";

const SCROLL_THRESHOLD = 120;

export default function MessageList({
  conversation,
  user,
  messages,
  loading = false,
  hasMoreOlder = false,
  loadingOlder = false,
  onLoadOlder,
  inquiryProducts,
  onAcceptInquiry,
  onRetry,
  onDeleteFailed,
}) {
  const { profile } = useAuth();
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const isNearBottomRef = useRef(true);
  const prevConvIdRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const loadingOlderRef = useRef(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);

  useEffect(() => {
    loadingOlderRef.current = loadingOlder;
  }, [loadingOlder]);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior,
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);
    const nearBottom = distanceToBottom < SCROLL_THRESHOLD;
    isNearBottomRef.current = nearBottom;
    setIsAtBottom(nearBottom);

    if (nearBottom) {
      setNewMessageCount(0);
    }

    if (scrollTop < 80 && hasMoreOlder && !loadingOlderRef.current && onLoadOlder) {
      prevScrollHeightRef.current = scrollHeight;
      onLoadOlder();
    }
  }, [hasMoreOlder, onLoadOlder]);

  // Preserve scroll offset when older messages are prepended
  useLayoutEffect(() => {
    if (prevScrollHeightRef.current > 0 && containerRef.current) {
      const newScrollHeight = containerRef.current.scrollHeight;
      const diff = newScrollHeight - prevScrollHeightRef.current;
      if (diff > 0) {
        containerRef.current.scrollTop += diff;
      }
      prevScrollHeightRef.current = 0;
    }
  }, [messages]);

  // When switching conversations: jump directly to bottom
  useEffect(() => {
    if (conversation?.id !== prevConvIdRef.current) {
      prevConvIdRef.current = conversation?.id;
      isNearBottomRef.current = true;
      setIsAtBottom(true);
      setNewMessageCount(0);
      prevMessagesLengthRef.current = 0;
      requestAnimationFrame(() => {
        scrollToBottom("auto");
      });
    }
  }, [conversation?.id, scrollToBottom]);

  // When messages array changes: auto-scroll only when appropriate
  useEffect(() => {
    if (!messages.length) {
      prevMessagesLengthRef.current = 0;
      return;
    }

    const prevLen = prevMessagesLengthRef.current;
    const isNewMessage = messages.length > prevLen;
    const lastMsg = messages[messages.length - 1];
    const isMyMessage = lastMsg?.senderId === profile?.uid;

    if (prevLen === 0) {
      // First load: jump to bottom
      requestAnimationFrame(() => {
        scrollToBottom("auto");
      });
    } else if (isNewMessage) {
      if (isMyMessage || isNearBottomRef.current) {
        // User sent a message or is near bottom: auto-scroll
        requestAnimationFrame(() => {
          scrollToBottom("smooth");
        });
        setNewMessageCount(0);
      } else {
        // New message from other user while backreading: show indicator
        setNewMessageCount((c) => c + 1);
      }
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, profile?.uid, scrollToBottom]);

  if (loading && !messages.length) {
    return (
      <div className="flex-1 min-w-0 p-4 space-y-4 animate-pulse overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`h-12 rounded-2xl bg-[var(--agri-hover)] ${
                i % 2 === 0 ? "w-48 sm:w-60" : "w-56 sm:w-72"
              }`}
            />
          </div>
        ))}
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--agri-text-muted)]">
        Start your conversation 👋
      </div>
    );
  }

  const otherUid = user?.uid || user?.id || conversation?.otherUser?.uid;
  const otherUserLastRead = conversation?.lastRead?.[otherUid];
  const otherUserUnreadCount =
    conversation?.rawUnreadCount?.[otherUid] ??
    (typeof conversation?.unreadCount === "object"
      ? conversation?.unreadCount?.[otherUid]
      : undefined);

  const hasReplyFromOther = Boolean(
    otherUid && messages.some((m) => m.senderId === otherUid),
  );

  function checkIfSeen(message, messageIndex) {
    if (message.read === true) return true;
    if (message.status === "failed") return false;

    if (hasReplyFromOther && typeof messageIndex === "number") {
      const hasLaterReply = messages
        .slice(messageIndex + 1)
        .some((m) => m.senderId === otherUid);
      if (hasLaterReply) return true;
    }

    if (otherUserUnreadCount === 0) {
      return true;
    }

    if (otherUserLastRead) {
      const readSeconds =
        otherUserLastRead.seconds ||
        (otherUserLastRead.toMillis
          ? otherUserLastRead.toMillis() / 1000
          : typeof otherUserLastRead === "number"
            ? otherUserLastRead / 1000
            : 0);

      const msgSeconds = message.createdAt
        ? message.createdAt.seconds ||
          (message.createdAt.toMillis
            ? message.createdAt.toMillis() / 1000
            : typeof message.createdAt === "number"
              ? message.createdAt / 1000
              : 0)
        : Infinity;

      if (readSeconds >= msgSeconds && readSeconds > 0) return true;
    }

    return false;
  }

  let lastMineIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].senderId === profile?.uid) {
      lastMineIndex = i;
      break;
    }
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y p-3 sm:p-4 space-y-3 scrollbar-none [overflow-anchor:auto]"
      >
        {/* Top Pagination Loader / Action */}
        {hasMoreOlder && (
          <div className="flex justify-center py-1.5 pb-2">
            {loadingOlder ? (
              <div className="flex items-center gap-2 text-xs text-[var(--agri-text-muted)] font-semibold bg-[var(--agri-card)]/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[var(--agri-border)] shadow-2xs">
                <i className="ri-loader-4-line animate-spin text-sm text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
                <span>Loading earlier messages...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (containerRef.current) {
                    prevScrollHeightRef.current =
                      containerRef.current.scrollHeight;
                  }
                  onLoadOlder?.();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)] hover:text-[#1B4332] dark:hover:text-[var(--agri-brand-light)] bg-[#E8F5EE]/80 dark:bg-[var(--agri-brand-bg-alt)]/80 hover:bg-[#E8F5EE] dark:hover:bg-[var(--agri-brand-bg-alt)] px-4 py-1.5 rounded-full border border-[#2D6A4F]/25 shadow-2xs transition cursor-pointer active:scale-95"
              >
                <i className="ri-history-line text-sm" />
                <span>Load earlier messages</span>
              </button>
            )}
          </div>
        )}

        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const isLastMine = index === lastMineIndex;
          const isSeen = checkIfSeen(message, index);

          return (
            <div key={message.id}>
              {shouldShowSeparator(message, previous) && (
                <MessageSeparator timestamp={message.createdAt} />
              )}

              {message.type === "product_inquiry" ? (
                <ProductInquiryMessage
                  user={user}
                  message={message}
                  product={inquiryProducts?.[message.productId]}
                  onAccept={onAcceptInquiry}
                  isLastMine={isLastMine}
                  isSeen={isSeen}
                />
              ) : (
                <MessageBubble
                  user={user}
                  message={message}
                  isLastMine={isLastMine}
                  isSeen={isSeen}
                  onRetry={onRetry}
                  onDeleteFailed={onDeleteFailed}
                />
              )}
            </div>
          );
        })}

        <div ref={bottomRef} className="h-0.5" />
      </div>

      {/* New messages indicator */}
      {!isAtBottom && newMessageCount > 0 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            type="button"
            onClick={() => {
              setNewMessageCount(0);
              scrollToBottom("smooth");
            }}
            className="flex items-center gap-2 bg-[#2D6A4F] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg hover:bg-[#1B4332] transition cursor-pointer active:scale-95"
          >
            <i className="ri-arrow-down-line text-sm" />
            <span>
              {newMessageCount === 1
                ? "1 new message"
                : `${newMessageCount} new messages`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
