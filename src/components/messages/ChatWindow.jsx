import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

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
        flex-1 flex-col bg-gray-50
        ${hasChat ? "flex" : "hidden md:flex"}
      `}
    >
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
