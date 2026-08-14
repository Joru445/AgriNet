import { getInitials } from "../../utils/getInitials";

export default function UserIdentity({
  user,
  currentUserId,
  size = "md",
  onlyPic = false,
  showUsername = true,
  showRole = false,
  showVerified = true,
  colorWhite = false,
  className = "",
}) {
  if (!user) return null;

  const isCurrentUser = currentUserId && user.uid === currentUserId;

  const isVerified =
    showVerified && user.role === "farmer" && user.verified === true;

  const sizes = {
    sm: {
      image: "h-8 w-8",
      name: "text-sm",
      username: "text-xs",
      badge: "text-sm",
    },

    md: {
      image: "h-10 w-10",
      name: "text-sm",
      username: "text-xs",
      badge: "text-base",
    },

    lg: {
      image: "h-12 w-12",
      name: "text-base",
      username: "text-sm",
      badge: "text-lg",
    },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      {user.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={user.fullname}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D8F3DC] text-sm font-semibold text-[#2D6A4F]">
          {getInitials(user.fullname)}
        </div>
      )}
      {!onlyPic && (
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <p
            className={`truncate font-semibold ${currentSize.name} ${colorWhite ? "text-gray-200" : "text-gray-900"}`}
          >
            {user.fullname || "Unknown User"}
          </p>

          {isVerified && (
            <span
              title="Verified Farmer"
              aria-label="Verified Farmer"
              className={`inline-flex shrink-0 items-center text-[#2D6A4F] ${currentSize.badge}`}
            >
              <i className="ri-verified-badge-fill" />
            </span>
          )}

          {isCurrentUser && (
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
              You
            </span>
          )}
        </div>

        {showUsername && user.username && (
          <p className={`truncate ${currentSize.username} ${colorWhite ? "text-gray-400" : "text-gray-500"} `}>
            @{user.username}
          </p>
        )}

        {showRole && user.role && (
          <p className={`truncate ${currentSize.username} ${colorWhite ? "text-gray-400" : "text-gray-500"}`}>
            {user.role}
          </p>
        )}
      </div>)}
    </div>
  );
}
