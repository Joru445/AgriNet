import Avatar from "../../common/Avatar";
import { formatTimestamp } from "../../../utils/date";
import { useAuth } from "../../../context/AuthContext";

export default function ConversationItem({
  item,
  searching,
  drafts = {},
  activeConversation,
  onConversation,
  onUser,
}) {
  const { profile } = useAuth();
  const user = searching ? item : item.otherUser;

  const targetKey = searching ? `user_${user?.uid}` : item.id;
  const draft =
    drafts[targetKey] ||
    (!searching && user?.uid ? drafts[`user_${user.uid}`] : null);
  const hasDraft = Boolean(draft && draft.trim());

  function handleClick() {
    if (searching) {
      onUser(user);
    } else {
      onConversation(item);
    }
  }

  const isSelected =
    !searching &&
    activeConversation &&
    (activeConversation.id === item.id ||
      activeConversation.otherUser?.uid === user?.uid);

  const isMine = !searching && item?.lastMessageSender === profile?.uid;
  const otherUid = user?.uid;
  const otherUnread =
    item?.rawUnreadCount?.[otherUid] ??
    (typeof item?.unreadCount === "object"
      ? item?.unreadCount?.[otherUid]
      : undefined) ??
    0;
  const otherLastRead = item?.lastRead?.[otherUid];

  const isSeen = (() => {
    if (!isMine) return false;
    if (otherUnread === 0 && item?.lastMessageAt) return true;
    if (otherLastRead && item?.lastMessageAt) {
      const readSec =
        otherLastRead.seconds ||
        (otherLastRead.toMillis
          ? otherLastRead.toMillis() / 1000
          : typeof otherLastRead === "number"
            ? otherLastRead / 1000
            : 0);
      const msgSec =
        item.lastMessageAt.seconds ||
        (item.lastMessageAt.toMillis
          ? item.lastMessageAt.toMillis() / 1000
          : typeof item.lastMessageAt === "number"
            ? item.lastMessageAt / 1000
            : 0);
      return readSec >= msgSec && msgSec > 0;
    }
    return false;
  })();

  return (
    <button
      onClick={handleClick}
      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-all duration-150 cursor-pointer ${
        isSelected
          ? "bg-[var(--agri-card)]/45 border-r-4 border-agri-primary shadow-xs"
          : "hover:bg-black/3 border-r-4 border-transparent"
      }`}
    >
      <div className="relative shrink-0">
        <Avatar src={user?.profilePicture} name={user?.fullname} />

        {user?.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[var(--agri-card)]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3
              className={`truncate ${
                isSelected
                  ? "font-semibold text-agri-dark dark:text-(--agri-dark)"
                  : !searching && !isMine && item.unreadCount > 0
                    ? "font-bold text-[var(--agri-text)]"
                    : "font-semibold text-[var(--agri-text)]"
              }`}
            >
              {user?.fullname}
            </h3>
            {user?.verified && (
              <span
                title="Verified Farmer"
                aria-label="Verified Farmer"
                className="inline-flex shrink-0 items-center text-[#2D6A4F] dark:text-[var(--agri-brand)] text-sm"
              >
                <i className="ri-verified-badge-fill" />
              </span>
            )}
            {user?.role === "admin" && (
              <span
                title="Official Admin"
                aria-label="Official Admin"
                className="inline-flex shrink-0 items-center rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-500/20"
              >
                Admin
              </span>
            )}
          </div>

          {!searching && (
            <span className="text-xs text-[var(--agri-text-muted)] whitespace-nowrap">
              {formatTimestamp(item.lastMessageAt)}
            </span>
          )}
        </div>

        {hasDraft ? (
          <p className="text-sm truncate">
            <span className="text-red-900/75 font-bold">Draft: </span>
            <span className="text-[var(--agri-text-secondary)]">{draft}</span>
          </p>
        ) : searching ? (
          <p className="text-sm text-[var(--agri-text-muted)] truncate">@{user?.username}</p>
        ) : isMine ? (
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <p className="text-sm text-[var(--agri-text-muted)] truncate flex-1 min-w-0">
              <span className="text-[var(--agri-text-secondary)] font-medium">You: </span>
              {item.lastMessage || "Sent a message"}
            </p>
            <span className="shrink-0 flex items-center gap-0.5 text-[11px] font-bold">
              {isSeen ? (
                <span
                  className="text-[var(--agri-text-muted)] flex items-center gap-0.5"
                  title="Seen"
                >
                  Seen
                </span>
              ) : (
                <span
                  className="text-[var(--agri-text-muted)] flex items-center gap-0.5 font-semibold"
                  title="Sent"
                >
                  Sent
                </span>
              )}
            </span>
          </div>
        ) : (
          <p
            className={`text-sm truncate ${
              item.unreadCount > 0 ? "font-bold text-[var(--agri-text)]" : "text-[var(--agri-text-muted)]"
            }`}
          >
            {item.lastMessage || "Start a conversation"}
          </p>
        )}
      </div>

      {!searching && !isMine && item.unreadCount > 0 && (
        <span className="min-w-5 h-5 rounded-full bg-[#2D6A4F] text-white text-xs font-bold flex items-center justify-center px-1 shrink-0">
          {item.unreadCount}
        </span>
      )}
    </button>
  );
}
