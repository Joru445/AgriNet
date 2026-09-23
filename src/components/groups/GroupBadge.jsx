import { Link } from "react-router-dom";

export default function GroupBadge({ groupId, groupName, groupImageUrl, size = "sm", className = "" }) {
  if (!groupName) return null;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
  };

  return (
    <Link
      to={`/groups/${encodeURIComponent(groupId)}`}
      title={groupName}
      className={`inline-flex items-center rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-(--agri-brand)/10 dark:text-(--agri-brand) font-medium transition-colors hover:bg-[#2D6A4F]/20 dark:hover:bg-(--agri-brand)/20 ${sizeClasses[size] || sizeClasses.sm} ${className}`}
    >
      {groupImageUrl ? (
        <img
          src={groupImageUrl}
          alt=""
          className="w-4 h-4 rounded-full object-cover shrink-0"
        />
      ) : (
        <i className="ri-team-fill text-xs shrink-0" />
      )}
      <span className="truncate max-w-[120px]">{groupName}</span>
    </Link>
  );
}
