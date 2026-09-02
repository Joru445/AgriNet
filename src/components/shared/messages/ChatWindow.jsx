import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import { useLanguage } from "../../../context/LanguageContext";

export default function ChatWindow({
  conversation,
  user,
  messages,
  loadingMessages = false,
  hasMoreOlder = false,
  loadingOlder = false,
  onLoadOlder,
  message,
  onMessageChange,
  hasChat,
  onSend,
  inquiryProduct,
  inquiryProducts,
  onCancelInquiry,
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
  const { t } = useLanguage();

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
          <span>{t("messages.offlineBanner")}</span>
        </div>
      )}

      <MessageList
        user={user}
        conversation={conversation}
        messages={messages}
        loading={loadingMessages}
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
        onCancelInquiry={onCancelInquiry}
        onSendInquiry={onSendInquiry}
        selectedImage={selectedImage}
        onSelectImage={onSelectImage}
        onRemoveImage={onRemoveImage}
        uploadingImage={uploadingImage}
      />
    </section>
  );
}
