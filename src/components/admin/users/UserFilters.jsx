import { useLanguage } from "../../../context/LanguageContext";

export default function UserFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  sortBy = "default",
  onSortByChange,
}) {
  const { t } = useLanguage();

  return (
    <div className="mb-6 rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-4.5 shadow-md shadow-black/5">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--agri-text-muted)] text-base" />

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("adminUser.searchPlaceholder")}
            className="w-full rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 py-2.5 pl-10 pr-4 text-sm font-medium text-[var(--agri-text)] placeholder-[var(--agri-text-muted)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/10"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/10 cursor-pointer"
        >
          <option value="default">{t("adminUser.sortDefault")}</option>
          <option value="name-asc">{t("adminUser.sortAz")}</option>
          <option value="name-desc">{t("adminUser.sortZa")}</option>
        </select>

        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/10 cursor-pointer"
        >
          <option value="all">{t("adminUser.allRoles")}</option>
          <option value="consumer">{t("roles.consumer")}</option>
          <option value="farmer">{t("roles.farmer")}</option>
          <option value="admin">{t("roles.admin")}</option>
        </select>

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/10 cursor-pointer"
        >
          <option value="all">{t("adminUser.allStatus")}</option>
          <option value="active">{t("adminStatus.active")}</option>
          <option value="suspended">{t("adminStatus.suspended")}</option>
        </select>
      </div>
    </div>
  );
}
