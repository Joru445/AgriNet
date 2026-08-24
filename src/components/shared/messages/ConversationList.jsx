import ConversationItem from "./ConversationItem";

export default function ConversationList({
  conversations = [],
  users = [],
  drafts = {},

  search,
  onSearch,

  activeConversation,

  onConversation,
  onUser,
  hasChat,
}) {
  const searching = search.trim().length > 0;

  return (
    <aside
      className={`w-full lg:w-80 md:w-64 flex flex-col border-r ${hasChat ? "hidden md:flex" : "flex"}`}
      style={{ backgroundColor: 'var(--agri-bg)', borderColor: 'var(--agri-border)' }}
    >
      <div className="p-4">
        <h2 className="text-xl font-bold text-[#1B4332] mb-4">Messages</h2>

        <div className="relative flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border-2 border-[#D6E6DC] shadow-xs focus-within:border-[#2D6A4F] focus-within:shadow-md focus-within:ring-3 focus-within:ring-[#2D6A4F]/15 transition-all">
          <i className="ri-search-line text-[#2D6A4F] text-lg font-bold shrink-0" />

          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search people..."
            className="w-full text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
          />

          {search && (
            <button
              type="button"
              onClick={() => onSearch("")}
              className="p-0.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer shrink-0"
              title="Clear search"
            >
              <i className="ri-close-circle-fill text-base text-gray-400 hover:text-gray-600" />
            </button>
          )}
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
                  drafts={drafts}
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

                {conversations.map((conversation, index) => (
                  <ConversationItem
                    key={conversation.id}
                    item={conversation}
                    index={index}
                    drafts={drafts}
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

                {users.map((user, index) => (
                  <ConversationItem
                    key={user.uid}
                    item={user}
                    index={index}
                    drafts={drafts}
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
