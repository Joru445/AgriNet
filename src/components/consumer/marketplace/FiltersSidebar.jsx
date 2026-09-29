import { useEffect, useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { getGroups } from "../../../services/group.service";
import Button from "../../ui/Button";

export default function FiltersSidebar({
  filters,
  onChange,
  onReset,
  mobile = false,
}) {
  const { t } = useLanguage();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getGroups()
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        const seen = new Set();
        const valid = [];
        for (const g of data) {
          const name = g?.name?.trim();
          if (name && !seen.has(name.toLowerCase())) {
            seen.add(name.toLowerCase());
            valid.push({ ...g, name });
          }
        }
        setGroups(valid);
      })
      .catch(() => {
        if (!cancelled) setGroups([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);
  const hasActiveFilters =
    Boolean(filters.search) ||
    (filters.category && filters.category !== "All") ||
    filters.distance < 10 ||
    filters.minPrice > 0 ||
    filters.maxPrice > 0 ||
    filters.rating > 0 ||
    Boolean(filters.showUnavailable) ||
    (filters.sellingMode && filters.sellingMode !== "all") ||
    (filters.group && filters.group !== "");

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-(--agri-border)">
        <h3 className="font-bold text-[#1B4332] dark:text-(--agri-text) flex items-center gap-2 text-base">
          <i className="ri-filter-3-line text-[#2D6A4F] dark:text-(--agri-brand) text-lg" />
          {t("nearby.filters")}
        </h3>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            {t("nearby.resetAll")}
          </Button>
        )}
      </div>

      {/* Selling Mode Filter */}
      <div>
        <label className="block mb-2 text-xs font-bold text-(--agri-text) flex items-center gap-1.5">
          <i className="ri-store-2-line text-(--agri-text-muted)" />
          {t("nearby.sellingMode")}
        </label>

        <div className="flex gap-2">
          {[
            { value: "all", label: t("nearby.all") },
            { value: "available", label: t("nearby.availableNow") },
            { value: "preorder", label: t("nearby.preOrder") },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange("sellingMode", option.value)}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                (filters.sellingMode || "all") === option.value
                  ? "bg-[#2D6A4F]/10 border-[#2D6A4F]/40 text-[#2D6A4F] dark:bg-[#2D6A4F]/20 dark:border-[#52b788] dark:text-[#52b788]"
                  : "border-(--agri-border) text-(--agri-text-secondary) hover:border-gray-400 dark:hover:border-neutral-500 bg-(--agri-input-bg)"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Group Filter */}
      {groups.length > 0 && (
        <div>
          <label className="block mb-2 text-xs font-bold text-(--agri-text) flex items-center gap-1.5">
            <i className="ri-team-line text-(--agri-text-muted)" />
            {t("nearby.group")}
          </label>

          <select
            value={
              groups.find(
                (g) =>
                  g.name?.toLowerCase() === (filters.group || "").toLowerCase() ||
                  g.id === filters.group,
              )?.name ||
              filters.group ||
              ""
            }
            onChange={(e) => onChange("group", e.target.value)}
            className="w-full border border-(--agri-input-border) rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D6A4F] dark:focus:border-emerald-500 bg-(--agri-input-bg) text-(--agri-text) cursor-pointer"
          >
            <option value="">{t("nearby.allGroups")}</option>
            {groups.map((group) => (
              <option key={group.id || group.name} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Distance Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-(--agri-text) flex items-center gap-1.5">
            <i className="ri-map-pin-range-line text-(--agri-text-muted)" />
            {t("nearby.distanceLabel", { distance: filters.distance })}
          </label>
        </div>

        <input
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={filters.distance}
          onChange={(e) => onChange("distance", Number(e.target.value))}
          className="w-full accent-[#2D6A4F] dark:accent-[#52b788] cursor-pointer"
        />

        <div className="flex justify-between text-xs text-(--agri-text-muted) mt-1">
          <span>0.5 km</span>
          <span>5 km</span>
          <span>10 km</span>
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block mb-2 text-xs font-bold text-(--agri-text) flex items-center gap-1.5">
          <i className="ri-money-dollar-circle-line text-(--agri-text-muted)" />
          {t("nearby.priceRange")}
        </label>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-(--agri-text-muted)">
              ₱
            </span>
            <input
              type="number"
              min="0"
              value={filters.minPrice > 0 ? filters.minPrice : ""}
              onChange={(e) =>
                onChange("minPrice", Math.max(0, Number(e.target.value) || 0))
              }
              className="w-full border border-(--agri-input-border) bg-(--agri-input-bg) text-(--agri-text) rounded-xl pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-[#2D6A4F] dark:focus:border-emerald-500"
              placeholder={t("nearby.minPrice")}
            />
          </div>

          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-(--agri-text-muted)">
              ₱
            </span>
            <input
              type="number"
              min="0"
              value={filters.maxPrice > 0 ? filters.maxPrice : ""}
              onChange={(e) =>
                onChange("maxPrice", Math.max(0, Number(e.target.value) || 0))
              }
              className="w-full border border-(--agri-input-border) bg-(--agri-input-bg) text-(--agri-text) rounded-xl pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-[#2D6A4F] dark:focus:border-emerald-500"
              placeholder={t("nearby.maxPrice")}
            />
          </div>
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <label className="block mb-2 text-xs font-bold text-(--agri-text) flex items-center gap-1.5">
          <i className="ri-star-smile-line text-(--agri-text-muted)" />
          {t("nearby.minRating")}
        </label>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() =>
                onChange("rating", filters.rating >= rating ? rating - 1 : rating)
              }
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                filters.rating >= rating
                  ? "bg-amber-500/15 border-amber-400 text-amber-500 shadow-xs"
                  : "border-(--agri-border) text-(--agri-text-muted) hover:border-amber-300 hover:text-amber-400 bg-(--agri-input-bg)"
              }`}
            >
              <i className="ri-star-fill text-sm" />
            </button>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div className="pt-4 border-t border-(--agri-border)">
        <label className="block mb-2 text-xs font-bold text-(--agri-text) flex items-center gap-1.5">
          <i className="ri-inbox-archive-line text-(--agri-text-muted)" />
          {t("nearby.availability")}
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl border border-(--agri-border) bg-(--agri-surface-subtle) hover:bg-(--agri-hover) hover:border-(--agri-border) transition-all cursor-pointer select-none">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="show-unavailable-checkbox"
              checked={Boolean(filters.showUnavailable)}
              onChange={(e) => onChange("showUnavailable", e.target.checked)}
              className="w-4 h-4 rounded border-(--agri-input-border) bg-(--agri-input-bg) text-[#2D6A4F] dark:text-(--agri-brand) accent-[#2D6A4F] dark:accent-[#52b788] focus:ring-[#2D6A4F] cursor-pointer"
            />
            <div>
              <span className="block text-xs font-bold text-(--agri-text)">
                {t("nearby.showUnavailable")}
              </span>
              <span className="block text-[10px] text-(--agri-text-muted) font-medium">
                {t("nearby.showUnavailableHint")}
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
              filters.showUnavailable
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                : "bg-(--agri-hover) text-(--agri-text-muted) border border-(--agri-border-subtle)"
            }`}
          >
            {filters.showUnavailable ? t("nearby.shown") : t("nearby.hidden")}
          </span>
        </label>
      </div>
    </div>
  );

  if (mobile) {
    return content;
  }

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="bg-(--agri-card) rounded-2xl border border-(--agri-border) shadow-md p-5 sticky top-20 z-30 max-h-[calc(100vh-6.5rem)] overflow-y-auto scrollbar-none">
        {content}
      </div>
    </aside>
  );
}
