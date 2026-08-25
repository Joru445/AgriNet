import useMessages from "../../hooks/useMessages";

import MessagesSkeleton from "../../components/shared/messages/MessageSkeleton";
import ConversationList from "../../components/shared/messages/ConversationList";
import ChatWindow from "../../components/shared/messages/ChatWindow";
import EmptyConversation from "../../components/shared/messages/EmptyConversation";

export default function Messages() {
  const {
    loading,

    filteredConversations,
    userResults,

    activeConversation,
    activeUser,

    messages,

    hasMoreOlder,
    loadingOlder,
    loadOlderMessages,

    inquiryProduct,
    inquiryProducts,
    sendInquiry,
    acceptInquiry,

    search,
    setSearch,

    message,
    setMessage,

    selectedImage,
    setSelectedImage,
    uploadingImage,

    drafts,
    isOnline,

    selectConversation,
    selectUser,

    sendMessage,
    retryMessage,
    deleteFailedMessage,
  } = useMessages();

  if (loading) {
    return <MessagesSkeleton />;
  }

  const hasChat = Boolean(activeConversation || activeUser);

  return (
    <main className="flex-1 h-full flex flex-col overflow-hidden">
      <div className="h-full flex flex-1 overflow-hidden" style={{ backgroundColor: 'var(--agri-bg)' }}>
        <ConversationList
          conversations={filteredConversations}
          users={userResults}
          drafts={drafts}
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
            hasMoreOlder={hasMoreOlder}
            loadingOlder={loadingOlder}
            onLoadOlder={loadOlderMessages}
            message={message}
            onMessageChange={setMessage}
            hasChat={hasChat}
            onSend={sendMessage}
            inquiryProduct={inquiryProduct}
            inquiryProducts={inquiryProducts}
            onSendInquiry={sendInquiry}
            onAcceptInquiry={acceptInquiry}
            isOnline={isOnline}
            onRetryMessage={retryMessage}
            onDeleteFailedMessage={deleteFailedMessage}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
            onRemoveImage={() => setSelectedImage(null)}
            uploadingImage={uploadingImage}
          />
        ) : (
          <EmptyConversation hasChat/>
        )}
      </div>
    </main>
  );
}
