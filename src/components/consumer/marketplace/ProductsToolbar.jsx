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
    <div className="flex items-center justify-between">
      {/* Product Count */}
      {loading ? (
        <span className="inline-block h-5 w-24 bg-(--agri-hover) rounded-md animate-pulse" />
      ) : (
        <span className="text-sm font-semibold text-(--agri-text-secondary)">
          {t("consumer.pagination.showing", { count: total, total })}
        </span>
      )}

      <div className="flex items-center gap-2 ml-auto">
        {/* Mobile Filters */}
        <Button variant="secondary" size="sm" icon="ri-filter-3-line" onClick={onOpenFilters} className="lg:hidden">
          {t("nearby.filters")}
        </Button>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="bg-(--agri-card) text-(--agri-text) px-3 py-2 border border-(--agri-border) rounded-xl font-semibold outline-none text-xs sm:text-sm cursor-pointer focus:border-[#2D6A4F] dark:focus:border-[#52b788] transition-colors"
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
