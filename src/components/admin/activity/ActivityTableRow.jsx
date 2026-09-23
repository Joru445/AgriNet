import { formatFullDateTime } from "../../../utils/date";

function getActionConfig(action) {
  switch (action) {
    case "user_suspended":
      return { color: "text-red-700 dark:text-red-400 border border-red-500/20", bg: "bg-red-500/10", icon: "ri-user-unfollow-line" };
    case "user_suspension_lifted":
      return { color: "text-green-700 dark:text-green-400 border border-green-500/20", bg: "bg-green-500/10", icon: "ri-user-follow-line" };
    case "farmer_verification_approved":
      return { color: "text-green-700 dark:text-green-400 border border-green-500/20", bg: "bg-green-500/10", icon: "ri-shield-check-line" };
    case "farmer_verification_rejected":
      return { color: "text-red-700 dark:text-red-400 border border-red-500/20", bg: "bg-red-500/10", icon: "ri-shield-close-line" };
    case "product_disabled":
      return { color: "text-amber-700 dark:text-amber-400 border border-amber-500/20", bg: "bg-amber-500/10", icon: "ri-eye-off-line" };
    case "product_re_enabled":
      return { color: "text-green-700 dark:text-green-400 border border-green-500/20", bg: "bg-green-500/10", icon: "ri-eye-line" };
    case "report_under_review":
      return { color: "text-blue-700 dark:text-blue-400 border border-blue-500/20", bg: "bg-blue-500/10", icon: "ri-search-eye-line" };
    case "report_resolved":
      return { color: "text-green-700 dark:text-green-400 border border-green-500/20", bg: "bg-green-500/10", icon: "ri-check-double-line" };
    case "report_dismissed":
      return { color: "text-(--agri-text-secondary) border border-(--agri-border)", bg: "bg-(--agri-hover)", icon: "ri-close-circle-line" };
    default:
      return { color: "text-(--agri-text-secondary) border border-(--agri-border)", bg: "bg-(--agri-hover)", icon: "ri-information-line" };
  }
}

function formatAction(action) {
  return action.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function ActivityTableRow({ log }) {
  const config = getActionConfig(log.action);

  return (
    <tr className="border-b border-(--agri-border-subtle) last:border-0 hover:bg-(--agri-hover)/50 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs ${config.bg} ${config.color}`}>
            <i className={`${config.icon} text-base`} />
          </div>
          <span className="text-sm font-bold text-(--agri-text)">
            {formatAction(log.action)}
          </span>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="space-y-1">
          <span className="inline-block rounded-md bg-(--agri-hover) px-2 py-0.5 text-[10px] font-bold text-(--agri-text-secondary) uppercase tracking-wider border border-(--agri-border-subtle) shadow-2xs">
            {log.targetType}
          </span>
          <p className="text-xs text-(--agri-text) font-mono font-medium truncate max-w-[200px]" title={log.targetId}>
            {log.targetId}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-(--agri-primary)/10 text-(--agri-primary) text-xs">
            <i className="ri-shield-user-line" />
          </span>
          <p className="text-xs text-(--agri-text) font-mono font-medium truncate max-w-[150px]" title={log.adminId}>
            {log.adminId}
          </p>
        </div>
      </td>

      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs text-(--agri-text-secondary) font-medium">
          <i className="ri-time-line text-(--agri-text-muted)" />
          <span>{formatFullDateTime(log.timestamp) || "—"}</span>
        </div>
      </td>
    </tr>
  );
}
