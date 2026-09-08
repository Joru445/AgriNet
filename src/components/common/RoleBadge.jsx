import { t } from "../../i18n";

function getRoleLabel(role) {
  switch (role) {
    case "admin":
      return t("roles.admin");

    case "farmer":
      return t("roles.farmer");

    case "consumer":
      return t("roles.consumer");

    default:
      return role || t("common.unknownUser");
  }
}

function getRoleClasses(role) {
  switch (role) {
    case "admin":
      return "bg-white text-purple-900 border border-purple-300 shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:bg-purple-950 dark:text-purple-200 dark:border-purple-700/60";

    case "farmer":
      return "bg-white text-emerald-900 border border-emerald-300 shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700/60";

    case "consumer":
      return "bg-white text-blue-900 border border-blue-300 shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700/60";

    default:
      return "bg-white text-[var(--agri-text)] border border-[var(--agri-border)] shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:bg-[var(--agri-card)] dark:text-[var(--agri-text)]";
  }
}

export default function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold tracking-wide ${getRoleClasses(
        role,
      )}`}
    >
      {getRoleLabel(role)}
    </span>
  );
}
