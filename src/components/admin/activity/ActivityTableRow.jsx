import { formatFullDateTime } from "../../../utils/date";
import { useLanguage } from "../../../context/LanguageContext";

function getActionConfig(action) {
  switch (action) {
    case "user_suspended":
      return { color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", icon: "ri-user-unfollow-line" };
    case "user_suspension_lifted":
      return { color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10", icon: "ri-user-follow-line" };
    case "farmer_verification_approved":
      return { color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10", icon: "ri-shield-check-line" };
    case "farmer_verification_rejected":
      return { color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", icon: "ri-shield-close-line" };
    case "product_disabled":
      return { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", icon: "ri-eye-off-line" };
    case "product_re_enabled":
      return { color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10", icon: "ri-eye-line" };
    case "report_under_review":
      return { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", icon: "ri-search-eye-line" };
    case "report_resolved":
      return { color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10", icon: "ri-check-double-line" };
    case "report_dismissed":
      return { color: "text-[var(--agri-text-secondary)]", bg: "bg-[var(--agri-hover)]", icon: "ri-close-circle-line" };
    default:
      return { color: "text-[var(--agri-text-secondary)]", bg: "bg-[var(--agri-hover)]", icon: "ri-information-line" };
  }
}

function formatAction(action) {
  return action.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function ActivityTableRow({ log }) {
  const { t } = useLanguage();
  const config = getActionConfig(log.action);

  return (
    <tr className="border-b border-[var(--agri-border-subtle)] last:border-0 hover:bg-[var(--agri-hover)]/60 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg} ${config.color}`}>
            <i className={`${config.icon} text-sm`} />
          </div>
          <span className="text-sm font-bold text-[var(--agri-text)]">
            {formatAction(log.action)}
          </span>
        </div>
      </td>

      <td className="px-5 py-4">
        <div>
          <span className="text-xs font-bold text-[var(--agri-text-muted)] uppercase">
            {log.targetType}
          </span>
          <p className="text-xs text-[var(--agri-text-secondary)] font-mono mt-0.5 truncate max-w-[200px]">
            {log.targetId}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-xs text-[var(--agri-text-secondary)] font-mono truncate max-w-[150px]">
          {log.adminId}
        </p>
      </td>

      <td className="px-5 py-4 whitespace-nowrap">
        <span className="text-xs font-semibold text-[var(--agri-text-secondary)]">
          {formatFullDateTime(log.timestamp) || "—"}
        </span>
      </td>
    </tr>
  );
}
