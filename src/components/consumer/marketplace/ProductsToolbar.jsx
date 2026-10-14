import { useLanguage } from "../../../context/LanguageContext";
import Select from "../../ui/Select";

export default function ProductsToolbar({ total = 0, loading = false, sort, onSort, filters, onRemoveFilter, onClearFilters }) {
  const { t } = useLanguage();
  const chips = [
    filters?.category !== "All" && ["category", filters.category],
    filters?.sellingMode !== "all" && ["sellingMode", filters.sellingMode],
    filters?.group && ["group", filters.group],
    filters?.distance !== 10 && ["distance", `${filters.distance} km`],
    filters?.minPrice > 0 && ["minPrice", `₱${filters.minPrice}+`],
    filters?.maxPrice > 0 && ["maxPrice", `≤ ₱${filters.maxPrice}`],
    filters?.rating > 0 && ["rating", `${filters.rating}★`],
    filters?.showUnavailable && ["showUnavailable", t("nearby.showUnavailable")],
  ].filter(Boolean);
  const sortOptions = [
    { value: "relevant", label: t("consumer.sort.relevant") },
    { value: "newest", label: t("consumer.sort.newest") },
    { value: "price-low", label: t("consumer.sort.priceLow") },
    { value: "price-high", label: t("consumer.sort.priceHigh") },
    { value: "rating", label: t("consumer.sort.highestRated") },
  ];
  return (
    <div className="space-y-3">
      <div className="flex min-w-0 items-center gap-2">
        <p className="min-w-0 flex-1 text-sm font-semibold text-(--agri-text-secondary)" aria-live="polite">
          {loading ? t("marketplace.loadingProducts") : t("marketplace.productCount", { count: total })}
        </p>
        <Select label="" aria-label={t("marketplace.sortProducts")} value={sort} onChange={(event) => onSort(event.target.value)} options={sortOptions} className="w-[10.5rem] shrink-0" selectClassName="h-10 rounded-xl py-0 text-xs" />
      </div>
      {chips.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label={t("marketplace.activeFilters")}>
          {chips.map(([key, label]) => <button key={key} type="button" onClick={() => onRemoveFilter(key)} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#2D6A4F]/25 bg-[#2D6A4F]/10 px-2.5 py-1 text-xs font-semibold text-[#2D6A4F] dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-300"><span>{label}</span><i className="ri-close-line" aria-hidden="true" /></button>)}
          <button type="button" onClick={onClearFilters} className="shrink-0 text-xs font-semibold text-[#2D6A4F] dark:text-(--agri-brand)">{t("marketplace.clearAll")}</button>
        </div>
      )}
    </div>
  );
}
