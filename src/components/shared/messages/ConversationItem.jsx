import { getInitials } from "../../../utils/getInitials";

import { formatTimestamp } from "../../../utils/date";

export default function ConversationItem({
  item,
  index = 0,
  searching,
  activeConversation,
  onConversation,
  onUser,
}) {
  const user = searching ? item : item.otherUser;

  const active = !searching && activeConversation?.id === item.id;
  const isEven = index % 2 === 0;

  function handleClick() {
    if (searching) {
      onUser(user);
    } else {
      onConversation(item);
    }
  }

  // Alternates: 1st is white (index 0), 2nd is slight grey (index 1), 3rd is white (index 2), etc.
  const bgClass = active
    ? "border-r-2 border-[#2D6A4F]"
    : isEven
    ? "bg-white hover:bg-green-50/70"
    : "bg-gray-50/90 hover:bg-green-50/70";

  return (
    <button
      onClick={handleClick}
      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors cursor-pointer ${bgClass}`}
      style={active ? { backgroundColor: "rgba(212,232,218,0.45)" } : {}}
    >
      <div className="relative shrink-0">
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={user.fullname}
            className="w-14 h-14 rounded-full object-cover object-top"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#D8F3DC] text-lg font-semibold text-[#2D6A4F]">
            {getInitials(user.fullname)}
          </div>
        )}

        {user.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-semibold truncate">{user.fullname}</h3>
            {user.verified && (
              <span
                title="Verified Farmer"
                aria-label="Verified Farmer"
                className="inline-flex shrink-0 items-center text-[#2D6A4F] text-sm"
              >
                <i className="ri-verified-badge-fill" />
              </span>
            )}
          </div>

          {!searching && (
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {formatTimestamp(item.lastMessageAt)}
            </span>
          )}
        </div>

        {searching ? (
          <p className="text-sm text-gray-500 truncate">@{user.username}</p>
        ) : (
          <p className="text-sm text-gray-500 truncate">
            {item.lastMessage || "Start a conversation"}
          </p>
        )}
      </div>

      {!searching && item.unreadCount > 0 && (
        <span className="min-w-5 h-5 rounded-full bg-[#2D6A4F] text-white text-xs flex items-center justify-center px-1">
          {item.unreadCount}
        </span>
      )}
    </button>
  );
}
