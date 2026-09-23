import { useLanguage } from "../../../context/LanguageContext";
import InlineSearchInput from "../../ui/InlineSearchInput";
import Button from "../../ui/Button";

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
    <div className="mb-6 rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-3.5">
        {/* Search */}
        <InlineSearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={t("adminReport.searchPlaceholder")}
        />

        {/* Dropdowns Row */}
        <div className="flex flex-col gap-2.5 sm:gap-3 md:flex-row md:items-center">
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:bg-(--agri-card) focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
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
            className="rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:bg-(--agri-card) focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
          >
            <option value="">{t("adminReport.allTypes")}</option>
            <option value="user">{t("adminReport.typeUser")}</option>
            <option value="product">{t("adminReport.typeProduct")}</option>
            <option value="store">{t("adminReport.typeStore")}</option>
            <option value="message">{t("adminReport.typeMessage")}</option>
          </select>

          {/* Date From */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:bg-(--agri-card) focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
            title={t("adminReport.dateFrom")}
          />

          {/* Date To */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:bg-(--agri-card) focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
            title={t("adminReport.dateTo")}
          />

          {/* Clear Filters */}
          {(status || targetType || dateFrom || dateTo) && (
            <Button
              variant="cancel"
              size="sm"
              onClick={() => {
                onStatusChange("");
                onTargetTypeChange("");
                onDateFromChange("");
                onDateToChange("");
              }}
              className="rounded-xl shadow-2xs"
            >
              <i className="ri-filter-off-line" />
              <span>{t("adminReport.clearFilters")}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
