import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";

export default function ChatWindow({
  user,
  messages,
  message,
  onMessageChange,
  hasChat,
  onSend,
  inquiryProduct,
  inquiryProducts,
  onSendInquiry,
  onAcceptInquiry,
}) {
  return (
    <section
      className={`
        relative flex-1 flex-col bg-gray-50
        ${hasChat ? "flex" : "hidden md:flex"}
      `}
    >
      <ChatHeader user={user} />

      <MessageList
        user={user}
        messages={messages}
        inquiryProducts={inquiryProducts}
        onAcceptInquiry={onAcceptInquiry}
      />

      <MessageInput
        value={message}
        onChange={onMessageChange}
        onSend={onSend}
        inquiryProduct={inquiryProduct}
        onSendInquiry={onSendInquiry}
      />
    </section>
  );
}
