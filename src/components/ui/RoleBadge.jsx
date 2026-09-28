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
      return "bg-purple-500/10 text-purple-800 border border-purple-500/25 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30";

    case "farmer":
      return "bg-emerald-500/10 text-emerald-800 border border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30";

    case "consumer":
      return "bg-sky-500/10 text-sky-800 border border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30";

    default:
      return "bg-(--agri-surface-subtle) text-(--agri-text-secondary) border border-(--agri-border)";
  }
}

export default function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold tracking-normal shadow-2xs ${getRoleClasses(
        role,
      )}`}
    >
      {getRoleLabel(role)}
    </span>
  );
}
