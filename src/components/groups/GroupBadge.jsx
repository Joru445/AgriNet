import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

export default function GroupBadge({
  groupId,
  groupName,
  groupImageUrl,
  size = "sm",
  showRole = false,
  className = "",
  onClick,
}) {
  const { t } = useLanguage();
  if (!groupName) return null;

  const sizeClasses = {
    xs: "text-[11px] px-2 py-0.5 gap-1",
    sm: "text-xs px-2.5 py-0.5 gap-1.5",
    md: "text-sm px-3 py-1 gap-2",
  };

  const badgeClasses = `inline-flex items-center rounded-full border border-[#2D6A4F]/20 dark:border-(--agri-brand)/30 bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-(--agri-brand)/10 dark:text-(--agri-brand) font-semibold transition-all hover:bg-[#2D6A4F]/20 dark:hover:bg-(--agri-brand)/20 shadow-2xs hover:shadow-xs shrink-0 ${sizeClasses[size] || sizeClasses.sm} ${className}`;

  const content = (
    <>
      {groupImageUrl ? (
        <img
          src={groupImageUrl}
          alt=""
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full object-cover shrink-0 ring-1 ring-[#2D6A4F]/30"
        />
      ) : (
        <i className="ri-community-line text-xs shrink-0" />
      )}
      <span className="truncate max-w-[130px] sm:max-w-[180px]">{groupName}</span>
      {showRole && (
        <span className="text-[10px] uppercase tracking-wider opacity-80 font-bold shrink-0">
          • {t("profile.member") || "Miyembro"}
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        title={`${groupName} — ${t("profile.member") || "Member"}`}
        className={`${badgeClasses} cursor-pointer`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={`/groups/${encodeURIComponent(groupId)}`}
      title={`${groupName} — ${t("profile.member") || "Member"}`}
      className={badgeClasses}
    >
      {content}
    </Link>
  );
}
