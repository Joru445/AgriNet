import { useLanguage } from "../../../context/LanguageContext";
import ConversationItem from "./ConversationItem";

export default function ConversationList({
  conversations = [],
  users = [],
  drafts = {},
  loading = false,

  search,
  onSearch,

  activeConversation,

    onConversation,
  onUser,
  hasChat,
}) {
  const { t } = useLanguage();
  const searching = search.trim().length > 0;

  return (
    <aside
      className={`w-full lg:w-80 md:w-64 flex flex-col border-r border-[var(--agri-border)] ${hasChat ? "hidden md:flex" : "flex"}`}
    >
      <div className="p-4">
        <h2 className="text-xl font-bold text-agri-dark dark:text-[var(--agri-brand-light)] mb-4">{t("nav.messages")}</h2>

        <div className="relative flex items-center gap-2 bg-[var(--agri-card)] rounded-xl px-3 py-1.5 border-2 border-[var(--agri-border)] shadow-xs focus-within:border-agri-primary focus-within:shadow-md focus-within:ring-3 focus-within:ring-[#2D6A4F]/15 transition-all">
          <i className="ri-search-line text-agri-primary text-lg font-bold shrink-0" />

          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t("messages.searchPeople")}
            className="w-full text-sm font-semibold text-[var(--agri-text)] placeholder-[var(--agri-text-muted)] focus:outline-none bg-transparent"
          />

          {search && (
            <button
              type="button"
              onClick={() => onSearch("")}
              className="p-0.5 rounded-full text-[var(--agri-text-muted)] hover:text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition cursor-pointer shrink-0"
              title={t("search.clear")}
            >
              <i className="ri-close-circle-fill text-base text-[var(--agri-text-muted)] hover:text-[var(--agri-text-secondary)]" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {!searching ? (
          <>
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs uppercase tracking-wide text-[var(--agri-text-muted)] font-semibold">
                {t("messages.recentChats")}
              </p>
            </div>

            {loading ? (
              <div className="space-y-1 p-2 animate-pulse">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-center px-3 py-2.5 rounded-xl"
                  >
                    <div className="w-11 h-11 rounded-full bg-[var(--agri-hover)] shrink-0" />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="h-3.5 w-24 bg-[var(--agri-hover)] rounded" />
                      <div className="h-2.5 w-36 bg-[var(--agri-hover)] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center text-[var(--agri-text-muted)] py-10 px-6">
                {t("messages.noConversations")}
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
                  <p className="text-xs uppercase tracking-wide text-[var(--agri-text-muted)] font-semibold">
                    {t("messages.recentChats")}
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
                  <p className="text-xs uppercase tracking-wide text-[var(--agri-text-muted)] font-semibold">
                    {t("messages.people")}
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
              <div className="text-center py-10 px-6 text-[var(--agri-text-muted)]">
                <i className="ri-user-search-line text-4xl mb-3 block" />

                <p>{t("messages.noPeopleFound")}</p>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
