import { useLanguage } from "../../../context/LanguageContext";
import InlineSearchInput from "../../ui/InlineSearchInput";

export default function ReportFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  targetType,
  onTargetTypeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}) {
  const { t } = useLanguage();

  return (
    <div className="mb-6 rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-4.5 shadow-md shadow-black/5">
      <div className="flex flex-col gap-3">
        {/* Search */}
        <InlineSearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={t("adminReport.searchPlaceholder")}
        />

        {/* Dropdowns Row */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
          >
            <option value="">{t("adminReport.allStatus")}</option>
            <option value="pending">{t("adminReport.pending")}</option>
            <option value="reviewing">{t("adminReport.reviewing")}</option>
            <option value="resolved">{t("adminReport.resolved")}</option>
            <option value="dismissed">{t("adminReport.dismissed")}</option>
          </select>

          {/* Target Type Filter */}
          <select
            value={targetType}
            onChange={(e) => onTargetTypeChange(e.target.value)}
            className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
          >
            <option value="">{t("adminReport.allTypes")}</option>
            <option value="user">{t("adminReport.typeUser")}</option>
            <option value="product">{t("adminReport.typeProduct")}</option>
          </select>

          {/* Date From */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
            title={t("adminReport.dateFrom")}
          />

          {/* Date To */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
            title={t("adminReport.dateTo")}
          />

          {/* Clear Filters */}
          {(status || targetType || dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                onStatusChange("");
                onTargetTypeChange("");
                onDateFromChange("");
                onDateToChange("");
              }}
              className="whitespace-nowrap rounded-xl border border-[var(--agri-border)] px-4 py-2.5 text-xs font-bold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition shadow-2xs cursor-pointer"
            >
              <i className="ri-filter-off-line mr-1" />
              {t("adminReport.clearFilters")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
