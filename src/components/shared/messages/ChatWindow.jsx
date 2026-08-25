import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";

export default function ChatWindow({
  conversation,
  user,
  messages,
  hasMoreOlder = false,
  loadingOlder = false,
  onLoadOlder,
  message,
  onMessageChange,
  hasChat,
  onSend,
  inquiryProduct,
  inquiryProducts,
  onSendInquiry,
  onAcceptInquiry,
  isOnline = true,
  onRetryMessage,
  onDeleteFailedMessage,
  selectedImage,
  onSelectImage,
  onRemoveImage,
  uploadingImage,
}) {
  return (
    <section
      className={`
        relative flex-1 min-w-0 w-full h-full overflow-hidden flex-col
        ${hasChat ? "flex" : "hidden md:flex"}
      `}
      style={{ backgroundColor: "var(--agri-bg)" }}
    >
      <ChatHeader user={user} />

      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2 shadow-xs shrink-0 select-none">
          <i className="ri-wifi-off-line text-sm" />
          <span>No internet connection. Messages will send once reconnected.</span>
        </div>
      )}

      <MessageList
        user={user}
        conversation={conversation}
        messages={messages}
        hasMoreOlder={hasMoreOlder}
        loadingOlder={loadingOlder}
        onLoadOlder={onLoadOlder}
        inquiryProducts={inquiryProducts}
        onAcceptInquiry={onAcceptInquiry}
        onRetry={onRetryMessage}
        onDeleteFailed={onDeleteFailedMessage}
      />

      <MessageInput
        value={message}
        onChange={onMessageChange}
        onSend={onSend}
        inquiryProduct={inquiryProduct}
        onSendInquiry={onSendInquiry}
        selectedImage={selectedImage}
        onSelectImage={onSelectImage}
        onRemoveImage={onRemoveImage}
        uploadingImage={uploadingImage}
      />
    </section>
  );
}
