import { useLanguage } from "../../../context/LanguageContext";

export default function ReportFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}) {
  const { t } = useLanguage();

  return (
    <div className="mb-6 rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-4.5 shadow-md shadow-black/5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Searchbar */}
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D6A4F] text-base font-bold" />

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("adminReport.searchPlaceholder")}
            className="w-full rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 py-2.5 pl-10 pr-10 text-sm font-semibold text-[var(--agri-text)] placeholder-[var(--agri-text-muted)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/15"
          />

          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--agri-text-muted)] hover:text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)]/60 transition cursor-pointer"
              title={t("search.clear")}
              aria-label={t("search.clear")}
            >
              <i className="ri-close-circle-fill text-base text-[var(--agri-text-muted)] hover:text-[var(--agri-text-secondary)]" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
        >
          <option value="all">{t("adminReport.allStatus")}</option>
          <option value="pending">{t("adminReport.pending")}</option>
          <option value="reviewing">{t("adminReport.reviewing")}</option>
          <option value="resolved">{t("adminReport.resolved")}</option>
          <option value="dismissed">{t("adminReport.dismissed")}</option>
        </select>
      </div>
    </div>
  );
}
