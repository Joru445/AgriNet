import ConversationItem from "./ConversationItem";

export default function ConversationList({
  conversations = [],
  users = [],

  search,
  onSearch,


  activeConversation,

  onConversation,
  onUser,
  hasChat,
}) {
  const searching = search.trim().length > 0;

  return (
    <aside className={`
      w-full lg:w-80 md:w-64 border-r border-gray-200 bg-white flex flex-col
      ${hasChat ? "hidden md:flex" : "flex"}
    `}>
      <div className="p-4">
        <h2 className="text-xl font-bold text-[#1B4332] mb-4">Messages</h2>

        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search people..."
            className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 outline-none focus:border-[#2D6A4F]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!searching ? (
          <>
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                Recent Chats
              </p>
            </div>

            {conversations.length === 0 ? (
              <div className="text-center text-gray-400 py-10 px-6">
                No conversations yet.
              </div>
            ) : (
              conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  item={conversation}
                  searching={false}
                  activeConversation={activeConversation}
                  onConversation={onConversation}
                  onUser={onUser}
                />
              ))
            )}
          </>
        ) : (
          <>
            {conversations.length > 0 && (
              <>
                <div className="px-4 pt-4 pb-2">
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                    Recent Chats
                  </p>
                </div>

                {conversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    item={conversation}
                    searching={false}
                    activeConversation={activeConversation}
                    onConversation={onConversation}
                    onUser={onUser}
                  />
                ))}
              </>
            )}

            {users.length > 0 && (
              <>
                <div className="px-4 pt-5 pb-2">
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                    People
                  </p>
                </div>

                {users.map((user) => (
                  <ConversationItem
                    key={user.uid}
                    item={user}
                    searching
                    activeConversation={activeConversation}
                    onConversation={onConversation}
                    onUser={onUser}
                  />
                ))}
              </>
            )}

            {conversations.length === 0 && users.length === 0 && (
              <div className="text-center py-10 px-6 text-gray-400">
                <i className="ri-user-search-line text-4xl mb-3 block" />

                <p>No people found.</p>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
