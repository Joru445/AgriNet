import { useLanguage } from "../../../context/LanguageContext";
import { CATEGORIES } from "../../../constants/categories";

export default function ProductFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sellingMode,
  onSellingModeChange,
  available,
  onAvailableChange,
  reported,
  onReportedChange,
}) {
  const { t } = useLanguage();

  return (
    <div className="mb-6 rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-4.5 shadow-md shadow-black/5">
      <div className="flex flex-col gap-3">
        {/* Row 1: Search */}
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D6A4F] text-base font-bold" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("adminProduct.searchPlaceholder")}
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

        {/* Row 2: Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Category */}
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-3 py-2 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
          >
            <option value="">{t("adminProduct.allCategories")}</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Selling Mode */}
          <select
            value={sellingMode}
            onChange={(e) => onSellingModeChange(e.target.value)}
            className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-3 py-2 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
          >
            <option value="">{t("adminProduct.allSellingModes")}</option>
            <option value="available">{t("adminProduct.availableNow")}</option>
            <option value="preorder">{t("adminProduct.preorder")}</option>
          </select>

          {/* Availability */}
          <select
            value={available}
            onChange={(e) => onAvailableChange(e.target.value)}
            className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-3 py-2 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
          >
            <option value="">{t("adminProduct.allAvailability")}</option>
            <option value="true">{t("adminProduct.available")}</option>
            <option value="false">{t("adminProduct.unavailable")}</option>
          </select>

          {/* Reported */}
          <select
            value={reported}
            onChange={(e) => onReportedChange(e.target.value)}
            className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-3 py-2 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
          >
            <option value="">{t("adminProduct.allProducts")}</option>
            <option value="true">{t("adminProduct.reported")}</option>
            <option value="false">{t("adminProduct.notReported")}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
