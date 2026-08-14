import { useEffect, useRef } from "react";

import MessageBubble from "./MessageBubble";
import ProductInquiryMessage from "./ProductInquiryMessage";
import MessageSeparator from "./MessageSeparator";

import { shouldShowSeparator } from "../../utils/chat";

export default function MessageList({
  user,
  messages,
  inquiryProducts,
  onAcceptInquiry,
}) {
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

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2 py-20 scrollbar-none">
      {messages.map((message, index) => {
        const previous = messages[index - 1];

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
              />
            ) : (
              <MessageBubble user={user} message={message} />
            )}
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
