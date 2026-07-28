import { useEffect, useRef } from "react";

import MessageBubble from "./MessageBubble";
import MessageSeparator from "./MessageSeparator";

import { shouldShowSeparator } from "../../utils/chat";

export default function MessageList({ user, messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (!messages.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Start your conversation 👋
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-none">
      {messages.map((message, index) => {
        const previous = messages[index - 1];

        return (
          <div key={message.id}>
            {shouldShowSeparator(message, previous) && (
              <MessageSeparator timestamp={message.createdAt} />
            )}

            <MessageBubble user={user} message={message} />
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
