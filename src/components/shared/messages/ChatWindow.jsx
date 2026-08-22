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
        relative flex-1 min-w-0 w-full h-full overflow-hidden flex-col
        ${hasChat ? "flex" : "hidden md:flex"}
      `}
      style={{ backgroundColor: 'var(--agri-bg)' }}
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
