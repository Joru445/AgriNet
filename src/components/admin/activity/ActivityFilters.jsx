import { useLanguage } from "../../../context/LanguageContext";
import InlineSearchInput from "../../ui/InlineSearchInput";
import Button from "../../ui/Button";

const AUDIT_ACTIONS = [
  "user_suspended",
  "user_suspension_lifted",
  "farmer_verification_approved",
  "farmer_verification_rejected",
  "product_disabled",
  "product_re_enabled",
  "report_under_review",
  "report_resolved",
  "report_dismissed",
];

const TARGET_TYPES = ["user", "product", "report", "farmer"];

export default function ActivityFilters({
  search,
  onSearchChange,
  action,
  onActionChange,
  targetType,
  onTargetTypeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}) {
  const { t } = useLanguage();

  const formatAction = (a) => {
    return a.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <div className="mb-6 rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-3.5">
        {/* Search */}
        <InlineSearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={t("adminActivity.searchPlaceholder")}
        />

        {/* Dropdowns Row */}
        <div className="flex flex-col gap-2.5 sm:gap-3 md:flex-row md:items-center">
          <select
            value={action}
            onChange={(e) => onActionChange(e.target.value)}
            className="rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:bg-(--agri-card) focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
          >
            <option value="">{t("adminActivity.allActions")}</option>
            {AUDIT_ACTIONS.map((a) => (
              <option key={a} value={a}>{formatAction(a)}</option>
            ))}
          </select>

          <select
            value={targetType}
            onChange={(e) => onTargetTypeChange(e.target.value)}
            className="rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:bg-(--agri-card) focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
          >
            <option value="">{t("adminActivity.allTypes")}</option>
            {TARGET_TYPES.map((t2) => (
              <option key={t2} value={t2}>{t2.charAt(0).toUpperCase() + t2.slice(1)}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:bg-(--agri-card) focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
            title={t("adminActivity.dateFrom")}
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:bg-(--agri-card) focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
            title={t("adminActivity.dateTo")}
          />

          {(action || targetType || dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onActionChange("");
                onTargetTypeChange("");
                onDateFromChange("");
                onDateToChange("");
              }}
              className="shadow-2xs"
            >
              <i className="ri-filter-off-line" />
              {t("adminActivity.clearFilters")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
