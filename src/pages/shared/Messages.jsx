import { useAuth } from "../../context/AuthContext";
import useMessages from "../../hooks/useMessages";

import ConversationList from "../../components/shared/messages/ConversationList";
import ChatWindow from "../../components/shared/messages/ChatWindow";
import EmptyConversation from "../../components/shared/messages/EmptyConversation";
import LoginRequired from "../../components/ui/LoginRequired";


export default function Messages() {
  const { user } = useAuth();
  const {
    loading,

    filteredConversations,
    userResults,

    activeConversation,
    activeUser,

    messages,
    loadingMessages,

    hasMoreOlder,
    loadingOlder,
    loadOlderMessages,

    inquiryProduct,
    inquiryProducts,
    cancelInquiryProduct,
    sendInquiry,
    acceptInquiry,

    search,
    setSearch,

    message,
    setMessage,

    replyTo,
    setReplyTo,
    clearReply,

    selectedImage,
    setSelectedImage,
    uploadingImage,
    isSending,

    drafts,
    isOnline,

    selectConversation,
    selectUser,

    sendMessage,
    retryMessage,
    deleteFailedMessage,
  } = useMessages();

  if (!user) {
    return <LoginRequired title="Messages" />;
  }

  const hasChat = Boolean(activeConversation || activeUser);

  return (
    <main className="flex-1 h-full flex flex-col overflow-hidden">
      <div className="h-full flex flex-1 overflow-hidden" style={{ backgroundColor: 'var(--agri-bg)' }}>
        <ConversationList
          conversations={filteredConversations}
          users={userResults}
          drafts={drafts}
          loading={loading}
          search={search}
          onSearch={setSearch}
          activeConversation={activeConversation}
          onConversation={selectConversation}
          onUser={selectUser}
          hasChat={hasChat}
        />

        {hasChat ? (
          <ChatWindow
            conversation={activeConversation}
            user={activeConversation?.otherUser ?? activeUser}
            messages={messages}
            loadingMessages={loadingMessages}
            hasMoreOlder={hasMoreOlder}
            loadingOlder={loadingOlder}
            onLoadOlder={loadOlderMessages}
            message={message}
            onMessageChange={setMessage}
            replyTo={replyTo}
            onSetReply={setReplyTo}
            onClearReply={clearReply}
            hasChat={hasChat}
            onSend={sendMessage}
            inquiryProduct={inquiryProduct}
            inquiryProducts={inquiryProducts}
            onCancelInquiry={cancelInquiryProduct}
            onSendInquiry={sendInquiry}
            onAcceptInquiry={acceptInquiry}
            isOnline={isOnline}
            onRetryMessage={retryMessage}
            onDeleteFailedMessage={deleteFailedMessage}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
            onRemoveImage={() => setSelectedImage(null)}
            uploadingImage={uploadingImage}
            isSending={isSending}
          />
        ) : (
          <EmptyConversation hasChat/>
        )}
      </div>
    </main>
  );
}
