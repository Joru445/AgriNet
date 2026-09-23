import DashboardSection from "../../ui/DashboardSection";

import { useLanguage } from "../../../context/LanguageContext";

export default function GroupOverview({ group, counts }) {
  const { t } = useLanguage();

  if (!group) return null;

  const stats = [
    {
      label: t("adminGroups.overview.memberCount"),
      value: counts?.members ?? 0,
      icon: "ri-user-line",
    },
    {
      label: t("adminGroups.overview.applicationCount"),
      value: counts?.applications ?? 0,
      icon: "ri-file-list-3-line",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border bg-(--agri-card) p-4 shadow-md"
          >
            <div className="flex items-center gap-2 text-(--agri-text-muted)">
              <i className={`${stat.icon} text-lg`} />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold text-(--agri-text)">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Description */}
      <DashboardSection
        title={t("adminGroups.overview.title")}
        icon="ri-information-line"
        compact
      >
        <div className="p-4 space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
              {t("adminGroups.overview.description")}
            </label>
            <p className="text-sm text-(--agri-text)">
              {group.description || (
                <span className="italic text-(--agri-text-muted)">
                  {t("adminGroups.overview.noDescription")}
                </span>
              )}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
              {t("adminGroups.overview.status")}
            </label>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
              group.active
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"
                : "bg-(--agri-hover) text-(--agri-text-muted) border border-(--agri-border-subtle)"
            }`}>
              {group.active ? t("adminGroups.active") : t("adminGroups.inactive")}
            </span>
          </div>
        </div>
      </DashboardSection>
    </div>
  );
}
