import { useLanguage } from "../../../context/LanguageContext";
import Button from "../../ui/Button";
import Select from "../../ui/Select";

export default function ProductsToolbar({
  total = 0,
  loading = false,
  sort,
  onSort,
  onRefresh,
  refreshing = false,
  lastRefreshedAt,
}) {
  const { t } = useLanguage();
  return (
    <div className="flex min-w-0 items-center gap-2">

      <div className="ml-auto flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
        <Button variant="secondary" size="icon-sm" icon={refreshing ? "ri-loader-4-line animate-spin" : "ri-refresh-line"}
          disabled={loading || refreshing} onClick={onRefresh} aria-label={t("marketplace.refreshProducts")}
          title={lastRefreshedAt ? t("marketplace.lastRefreshed", { time: new Date(lastRefreshedAt).toLocaleTimeString() }) : t("marketplace.refreshProducts")}
          className="h-11 w-11 shrink-0 sm:h-8 sm:w-8" />
        {/* Sort */}
        <Select label="" aria-label={t("marketplace.sortProducts")} value={sort} onChange={(e) => onSort(e.target.value)} className="min-w-0 flex-1 sm:w-36 sm:flex-none" selectClassName="h-11 min-w-0 truncate rounded-xl py-0 text-xs sm:h-8">
          <option value="relevant">{t("consumer.sort.relevant")}</option>
          <option value="newest">{t("consumer.sort.newest")}</option>
          <option value="price-low">{t("consumer.sort.priceLow")}</option>
          <option value="price-high">{t("consumer.sort.priceHigh")}</option>
          <option value="rating">{t("consumer.sort.highestRated")}</option>
        </Select>
      </div>
    </div>
  );
}
