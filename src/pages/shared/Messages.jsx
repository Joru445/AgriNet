import useMessages from "../../hooks/useMessages";

import MessagesSkeleton from "../../components/messages/MessageSkeleton";
import ConversationList from "../../components/messages/ConversationList";
import ChatWindow from "../../components/messages/ChatWindow";
import EmptyConversation from "../../components/messages/EmptyConversation";

export default function Messages() {
  const {
    loading,

    filteredConversations,
    userResults,

    activeConversation,
    activeUser,

    messages,

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

  const hasChat = activeConversation || activeUser;

  return (
    <main className="flex-1 pb-16 md:pb-0 h-[calc(100vh-4rem)] overflow-hidden">
      <div className="bg-white h-full flex overflow-hidden">
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
          />
        ) : (
          <EmptyConversation hasChat/>
        )}
      </div>
    </main>
  );
}
