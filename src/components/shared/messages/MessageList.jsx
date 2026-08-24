import { useEffect, useRef } from "react";

import { useAuth } from "../../../context/AuthContext";
import MessageBubble from "./MessageBubble";
import ProductInquiryMessage from "./ProductInquiryMessage";
import MessageSeparator from "./MessageSeparator";

import { shouldShowSeparator } from "../../../utils/chat";

export default function MessageList({
  conversation,
  user,
  messages,
  inquiryProducts,
  onAcceptInquiry,
  onRetry,
  onDeleteFailed,
}) {
  const { profile } = useAuth();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!messages.length) return;

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    });
  }, [messages, inquiryProducts]);

  if (!messages.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Start your conversation 👋
      </div>
    );
  }

  const otherUid = user?.uid || user?.id;
  const otherUserLastRead = conversation?.lastRead?.[otherUid];
  const otherUserUnreadCount = conversation?.unreadCount?.[otherUid];

  function checkIfSeen(message) {
    if (message.read === true) return true;
    if (message.status === "failed") return false;
    if (otherUserUnreadCount === 0 && message.createdAt) return true;
    if (otherUserLastRead && message.createdAt) {
      const readSeconds =
        otherUserLastRead.seconds ||
        (otherUserLastRead.toMillis ? otherUserLastRead.toMillis() / 1000 : 0);
      const msgSeconds =
        message.createdAt.seconds ||
        (message.createdAt.toMillis ? message.createdAt.toMillis() / 1000 : 0);
      if (readSeconds >= msgSeconds && msgSeconds > 0) return true;
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
    <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y p-3 sm:p-4 space-y-3 scrollbar-none">
      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const isLastMine = index === lastMineIndex;
        const isSeen = checkIfSeen(message);

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

      <div ref={bottomRef} />
    </div>
  );
}
