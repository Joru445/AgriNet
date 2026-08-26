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
          ? "bg-[#D8F3DC]/45 border-r-4 border-[#2D6A4F] shadow-xs"
          : "hover:bg-black/3 border-r-4 border-transparent"
      }`}
    >
      <div className="relative shrink-0">
        <Avatar src={user?.profilePicture} name={user?.fullname} />

        {user?.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3
              className={`truncate ${
                isSelected
                  ? "font-bold text-[#1B4332]"
                  : !searching && !isMine && item.unreadCount > 0
                    ? "font-bold text-gray-900"
                    : "font-semibold text-gray-800"
              }`}
            >
              {user?.fullname}
            </h3>
            {user?.verified && (
              <span
                title="Verified Farmer"
                aria-label="Verified Farmer"
                className="inline-flex shrink-0 items-center text-[#2D6A4F] text-sm"
              >
                <i className="ri-verified-badge-fill" />
              </span>
            )}
            {user?.role === "admin" && (
              <span
                title="Official Admin"
                aria-label="Official Admin"
                className="inline-flex shrink-0 items-center rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200"
              >
                Admin
              </span>
            )}
          </div>

          {!searching && (
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {formatTimestamp(item.lastMessageAt)}
            </span>
          )}
        </div>

        {hasDraft ? (
          <p className="text-sm truncate">
            <span className="text-red-900/75 font-bold">Draft: </span>
            <span className="text-gray-600">{draft}</span>
          </p>
        ) : searching ? (
          <p className="text-sm text-gray-500 truncate">@{user?.username}</p>
        ) : isMine ? (
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <p className="text-sm text-gray-500 truncate flex-1 min-w-0">
              <span className="text-gray-600 font-medium">You: </span>
              {item.lastMessage || "Sent a message"}
            </p>
            <span className="shrink-0 flex items-center gap-0.5 text-[11px] font-bold">
              {isSeen ? (
                <span
                  className="text-gray-400 flex items-center gap-0.5"
                  title="Seen"
                >
                  Seen
                </span>
              ) : (
                <span
                  className="text-gray-400 flex items-center gap-0.5 font-semibold"
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
              item.unreadCount > 0 ? "font-bold text-gray-900" : "text-gray-500"
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
