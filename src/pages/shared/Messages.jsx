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

    inquiryProduct,
    inquiryProducts,
    sendInquiry,
    acceptInquiry,

    search,
    setSearch,

    message,
    setMessage,

    selectConversation,
    selectUser,

    sendMessage,
  } = useMessages();

  if (loading) {
    return <MessagesSkeleton />;
  }

  const hasChat = Boolean(activeConversation || activeUser);

  return (
    <main className="flex-1 pb-16 md:pb-0 h-[calc(100vh-4rem)] overflow-hidden">
      <div className="h-full flex overflow-hidden" style={{ backgroundColor: 'var(--agri-bg)' }}>
        <ConversationList
          conversations={filteredConversations}
          users={userResults}
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
            message={message}
            onMessageChange={setMessage}
            hasChat={hasChat}
            onSend={sendMessage}
            inquiryProduct={inquiryProduct}
            inquiryProducts={inquiryProducts}
            onSendInquiry={sendInquiry}
            onAcceptInquiry={acceptInquiry}
          />
        ) : (
          <EmptyConversation hasChat/>
        )}
      </div>
    </main>
  );
}
