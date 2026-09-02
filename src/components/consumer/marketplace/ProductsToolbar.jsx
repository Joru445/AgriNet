import { useLanguage } from "../../../context/LanguageContext";

export default function ProductsToolbar({
  total = 0,
  loading = false,
  sort,
  onSort,
  onOpenFilters,
}) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-betweenaw">
      {/* Product Count */}
      {loading ? (
        <span className="inline-block h-5 w-24 bg-[var(--agri-hover)] rounded-md animate-pulse" />
      ) : (
        <span className="text-sm font-semibold text-[var(--agri-text-secondary)]">
          {t("consumer.pagination.showing", { count: total, total })}
        </span>
      )}

      <div className="flex items-center gap-2 ml-auto">
        {/* Mobile Filters */}
        <button
          type="button"
          onClick={onOpenFilters}
          className="lg:hidden flex items-center gap-2 px-3 py-2 bg-[var(--agri-card)] border border-[var(--agri-border)] text-xs sm:text-sm rounded-xl font-semibold cursor-pointer"
        >
          <i className="ri-filter-3-line text-[#2D6A4F]" />
          <span>{t("nearby.filters")}</span>
        </button>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="bg-[var(--agri-card)] px-3 py-2 border border-[var(--agri-border)] rounded-xl font-semibold outline-none text-xs sm:text-sm cursor-pointer"
        >
          <option value="relevant">{t("consumer.sort.relevant")}</option>
          <option value="newest">{t("consumer.sort.newest")}</option>
          <option value="price-low">{t("consumer.sort.priceLow")}</option>
          <option value="price-high">{t("consumer.sort.priceHigh")}</option>
          <option value="rating">{t("consumer.sort.highestRated")}</option>
        </select>
      </div>
    </div>
  );
}
