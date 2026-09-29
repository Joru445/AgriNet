import { useLanguage } from "../../../context/LanguageContext";
import Button from "../../ui/Button";

export default function ProductsToolbar({
  total = 0,
  loading = false,
  sort,
  onSort,
  onOpenFilters,
}) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4 min-w-0">
      {/* Product Count */}
      {loading ? (
        <span className="inline-block h-5 w-20 sm:w-24 bg-(--agri-hover) rounded-md animate-pulse shrink-0" />
      ) : (
        <span className="text-xs sm:text-sm font-semibold text-(--agri-text-secondary) leading-tight min-w-0 flex-1">
          {t("consumer.pagination.showing", { count: total, total })}
        </span>
      )}

      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
        {/* Mobile Filters */}
        <Button
          variant="secondary"
          size="sm"
          icon="ri-filter-3-line"
          onClick={onOpenFilters}
          className="lg:hidden px-2.5 sm:px-3 h-8 text-xs shrink-0 whitespace-nowrap"
        >
          {t("nearby.filters")}
        </Button>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="bg-(--agri-card) text-(--agri-text) px-2.5 sm:px-3 h-8 sm:h-9 border border-(--agri-border) rounded-xl font-semibold outline-none text-xs sm:text-sm cursor-pointer focus:border-[#2D6A4F] dark:focus:border-[#52b788] transition-colors shrink-0 max-w-[130px] sm:max-w-none"
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
