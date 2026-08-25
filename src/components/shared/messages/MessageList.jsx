import { useEffect, useLayoutEffect, useRef } from "react";

import { useAuth } from "../../../context/AuthContext";
import MessageBubble from "./MessageBubble";
import ProductInquiryMessage from "./ProductInquiryMessage";
import MessageSeparator from "./MessageSeparator";

import { shouldShowSeparator } from "../../../utils/chat";

export default function MessageList({
  conversation,
  user,
  messages,
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
  loadingOlderRef.current = loadingOlder;

  const scrollToBottom = (behavior = "smooth") => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior,
    });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Considered near bottom if within 140px of bottom
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);
    isNearBottomRef.current = distanceToBottom < 140;

    // Trigger load older messages when user scrolls near top
    if (scrollTop < 80 && hasMoreOlder && !loadingOlderRef.current && onLoadOlder) {
      prevScrollHeightRef.current = scrollHeight;
      onLoadOlder();
    }
  };

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
      requestAnimationFrame(() => {
        scrollToBottom("auto");
      });
    }
  }, [conversation?.id]);

  // When messages array changes: only auto-scroll if new message was appended and user was already at bottom or sent it
  useEffect(() => {
    if (!messages.length) {
      prevMessagesLengthRef.current = 0;
      return;
    }

    const isNewMessage = messages.length > prevMessagesLengthRef.current;
    const lastMsg = messages[messages.length - 1];
    const isMyMessage = lastMsg?.senderId === profile?.uid;

    if (prevMessagesLengthRef.current === 0) {
      requestAnimationFrame(() => {
        scrollToBottom("auto");
      });
    } else if (isNewMessage && (isMyMessage || isNearBottomRef.current)) {
      requestAnimationFrame(() => {
        scrollToBottom("smooth");
      });
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, profile?.uid]);

  if (!messages.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
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

  // Check if any message from other user exists in the conversation
  const hasReplyFromOther = Boolean(
    otherUid && messages.some((m) => m.senderId === otherUid),
  );

  function checkIfSeen(message, messageIndex) {
    if (message.read === true) return true;
    if (message.status === "failed") return false;

    // 1. If the other user sent a message after this one, this message was seen
    if (hasReplyFromOther && typeof messageIndex === "number") {
      const hasLaterReply = messages
        .slice(messageIndex + 1)
        .some((m) => m.senderId === otherUid);
      if (hasLaterReply) return true;
    }

    // 2. If the other user's unread count is 0 in this conversation
    if (otherUserUnreadCount === 0) {
      return true;
    }

    // 3. Check if other user's lastRead timestamp is >= message timestamp
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
        : Math.floor(Date.now() / 1000);

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
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y p-3 sm:p-4 space-y-3 scrollbar-none [overflow-anchor:auto]"
    >
      {/* Top Pagination Loader / Action */}
      {hasMoreOlder && (
        <div className="flex justify-center py-1.5 pb-2">
          {loadingOlder ? (
            <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-gray-200 shadow-2xs">
              <i className="ri-loader-4-line animate-spin text-sm text-[#2D6A4F]" />
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
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] bg-[#E8F5EE]/80 hover:bg-[#E8F5EE] px-4 py-1.5 rounded-full border border-[#2D6A4F]/25 shadow-2xs transition cursor-pointer active:scale-95"
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
  );
}
