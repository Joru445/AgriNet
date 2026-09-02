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
      return "bg-purple-500/10 text-purple-700 dark:text-purple-300";

    case "farmer":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";

    case "consumer":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300";

    default:
      return "bg-[var(--agri-hover)] text-[var(--agri-text-secondary)]";
  }
}

export default function RoleBadge({ role }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getRoleClasses(
        role,
      )}`}
    >
      {getRoleLabel(role)}
    </span>
  );
}
