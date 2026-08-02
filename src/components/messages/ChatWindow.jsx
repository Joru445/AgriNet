import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({
  user,
  messages,
  message,
  onMessageChange,
  hasChat,
  onSend,
}) {
  return (
    <section className={`
      flex-1 md:flex flex-col bg-gray-50 scroll-y-none
      ${hasChat ? "flex" : "hidden md:flex"}
      `}
    >
      <ChatHeader user={user} />

      <MessageList user={user} messages={messages} />

      <MessageInput
        value={message}
        onChange={onMessageChange}
        onSend={onSend}
      />
    </section>
  );
}
