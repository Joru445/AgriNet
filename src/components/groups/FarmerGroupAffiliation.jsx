import { Link } from "react-router-dom";

import { useLanguage } from "../../context/LanguageContext";

function getApprovedGroups(groups) {
  const uniqueGroups = new Map();

  for (const group of Array.isArray(groups) ? groups : []) {
    if (
      group?.status !== "approved" ||
      !group.groupId ||
      !group.groupName
    ) {
      continue;
    }

    uniqueGroups.set(group.groupId, group);
  }

  return [...uniqueGroups.values()].sort((a, b) =>
    a.groupName.localeCompare(b.groupName, undefined, {
      sensitivity: "base",
    }),
  );
}

function GroupNameLink({ group, compact = false }) {
  return (
    <Link
      to={`/groups/${encodeURIComponent(group.groupId)}`}
      title={group.groupName}
      className={`inline-flex min-w-0 items-center gap-1 rounded-full bg-[#2D6A4F]/10 font-medium text-[#2D6A4F] transition-colors hover:bg-[#2D6A4F]/20 dark:bg-(--agri-brand)/10 dark:text-(--agri-brand) dark:hover:bg-(--agri-brand)/20 ${
        compact ? "max-w-[11rem] px-1.5 py-0.5 text-[11px]" : "px-2.5 py-1 text-sm"
      }`}
    >
      {group.groupImageUrl ? (
        <img
          src={group.groupImageUrl}
          alt=""
          className={`${compact ? "h-3 w-3" : "h-4 w-4"} shrink-0 rounded-full object-cover`}
        />
      ) : (
        <i className={`${compact ? "text-xs" : "text-sm"} ri-community-line shrink-0`} />
      )}
      <span className="truncate">{group.groupName}</span>
    </Link>
  );
}

/**
 * Shows approved group affiliations without conflating them with AgriNet
 * farmer verification. The approved-groups API supplies the status field.
 */
export default function FarmerGroupAffiliation({
  groups,
  variant = "compact",
  className = "",
}) {
  const { t } = useLanguage();
  const approvedGroups = getApprovedGroups(groups);

  if (approvedGroups.length === 0) {
    return null;
  }

  if (variant === "full") {
    return (
      <section className={className}>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-(--agri-text)">
          <i className="ri-community-line text-[#2D6A4F] dark:text-(--agri-brand)" />
          {t("profile.organizations")}
        </h3>
        <ul className="space-y-2">
          {approvedGroups.map((group) => (
            <li key={group.groupId} className="flex min-w-0 items-center gap-2">
              <GroupNameLink group={group} />
              <span className="text-xs text-(--agri-text-muted)">
                {t("profile.member")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const [primaryGroup] = approvedGroups;
  const additionalCount = approvedGroups.length - 1;

  return (
    <div
      className={`flex min-w-0 items-center gap-1.5 text-xs text-(--agri-text-muted) ${className}`}
      title={approvedGroups.map((group) => group.groupName).join(", ")}
    >
      <GroupNameLink group={primaryGroup} compact />
      {additionalCount > 0 ? (
        <span className="shrink-0">+{additionalCount}</span>
      ) : (
        <span className="shrink-0">{t("profile.member")}</span>
      )}
    </div>
  );
}
