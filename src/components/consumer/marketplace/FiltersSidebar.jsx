import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { getGroups } from "../../../services/group.service";
import Button from "../../ui/Button";
import RangeSlider from "../../ui/RangeSlider";
import Select from "../../ui/Select";

export default function FiltersSidebar({
  filters,
  onChange,
  onReset,
  mobile = false,
  visible = true,
}) {

  const { t } = useLanguage();
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState(false);
  const mountedRef = useRef(true);
  const [priceRange, setPriceRange] = useState([
    filters.minPrice,
    filters.maxPrice || 10000,
  ]);
  useEffect(() => () => { mountedRef.current = false; }, []);

  // Groups are intentionally loaded only when the Group dropdown opens. The
  // service supplies a shared cached value or shared in-flight request, so
  // opening either desktop or mobile controls never duplicates a network read.
  const loadGroups = useCallback(async () => {
    setGroupsLoading(true);
    setGroupsError(false);
    try {
      const data = await getGroups();
      if (mountedRef.current) setGroups(Array.isArray(data) ? data : []);
    } catch {
      if (mountedRef.current) setGroupsError(true);
    } finally {
      if (mountedRef.current) setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPriceRange([filters.minPrice, filters.maxPrice || 10000]);
  }, [filters.minPrice, filters.maxPrice]);
  const active =
    Boolean(filters.search) ||
    filters.category !== "All" ||
    filters.distance < 10 ||
    filters.minPrice > 0 ||
    filters.maxPrice > 0 ||
    filters.rating > 0 ||
    filters.showUnavailable ||
    filters.sellingMode !== "all" ||
    Boolean(filters.group);
  const groupOptions = [
    { value: "", label: t("nearby.allGroups") },
    ...groups.map((group) => ({ value: group.id || group.name, label: group.name })),
  ];
  if (filters.group && !groupOptions.some((group) => group.value === filters.group)) {
    groupOptions.push({ value: filters.group, label: `${t("nearby.selectedGroup")}: ${filters.group}` });
  }
  const groupStatus = groupsLoading
    ? t("nearby.loadingGroups")
    : groupsError
      ? t("nearby.groupsLoadFailed")
      : groups.length === 0
        ? t("nearby.noGroups")
        : undefined;

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-(--agri-border) pb-3">
        <h3 className="flex items-center gap-2 text-base font-bold text-[#1B4332] dark:text-(--agri-text)">
          <i className="ri-filter-3-line text-lg text-[#2D6A4F] dark:text-(--agri-brand)" />
          {t("nearby.filters")}
        </h3>
        {active && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            {t("nearby.resetAll")}
          </Button>
        )}
      </div>
      <fieldset>
        <legend className="mb-2 flex items-center gap-1.5 text-xs font-bold text-(--agri-text)">
          <i className="ri-store-2-line text-(--agri-text-muted)" />
          {t("nearby.sellingMode")}
        </legend>
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
              className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${filters.sellingMode === option.value ? "border-[#2D6A4F]/40 bg-[#2D6A4F]/10 text-[#2D6A4F] dark:border-[#52b788] dark:bg-[#2D6A4F]/20 dark:text-[#52b788]" : "border-(--agri-border) bg-(--agri-input-bg) text-(--agri-text-secondary)"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-(--agri-text)"><i className="ri-team-line text-(--agri-text-muted)" />{t("nearby.group")}</div>
        <Select
          value={filters.group || ""}
          onChange={(event) => onChange("group", event.target.value)}
          options={groupOptions}
          onOpenChange={(open) => { if (open) loadGroups(); }}
          loading={groupsLoading}
          statusMessage={groupStatus}
          onRetry={groupsError ? loadGroups : undefined}
          retryLabel={t("ui.retry")}
          aria-label={t("nearby.group")}
        />
      </div>
      <div>
        <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-(--agri-text)">
          <i className="ri-map-pin-range-line text-(--agri-text-muted)" />
          {t("nearby.distanceLabel", { distance: filters.distance })}
        </label>
        <input
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={filters.distance}
          onChange={(event) => onChange("distance", Number(event.target.value))}
          className="w-full cursor-pointer accent-[#2D6A4F] dark:accent-[#52b788]"
        />
        <div className="mt-1 flex justify-between text-xs text-(--agri-text-muted)">
          <span>0.5 km</span>
          <span>5 km</span>
          <span>10 km</span>
        </div>
      </div>
      <div>
        <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-(--agri-text)">
          <i className="ri-money-dollar-circle-line text-(--agri-text-muted)" />
          {t("nearby.priceRange")}
        </label>
        <RangeSlider
          label={t("nearby.priceRange")}
          value={priceRange}
          onChange={setPriceRange}
          onCommit={([minPrice, maxPrice]) => {
            onChange("minPrice", minPrice);
            onChange("maxPrice", maxPrice === 10000 ? 0 : maxPrice);
          }}
        />
        {(filters.minPrice > 0 || filters.maxPrice > 0) && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => {
              setPriceRange([0, 10000]);
              onChange("minPrice", 0);
              onChange("maxPrice", 0);
            }}
          >
            {t("marketplace.resetPriceRange")}
          </Button>
        )}
      </div>
      <fieldset>
        <legend className="mb-2 flex items-center gap-1.5 text-xs font-bold text-(--agri-text)">
          <i className="ri-star-smile-line text-(--agri-text-muted)" />
          {t("nearby.minRating")}
        </legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              aria-label={`${rating} stars`}
              onClick={() =>
                onChange(
                  "rating",
                  filters.rating >= rating ? rating - 1 : rating,
                )
              }
              className={`grid h-9 w-9 place-items-center rounded-xl border ${filters.rating >= rating ? "border-amber-400 bg-amber-500/15 text-amber-500" : "border-(--agri-border) bg-(--agri-input-bg) text-(--agri-text-muted)"}`}
            >
              <i className="ri-star-fill text-sm" />
            </button>
          ))}
        </div>
      </fieldset>
      <div className="border-t border-(--agri-border) pt-4">
        <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-(--agri-text)"><i className="ri-inbox-archive-line text-(--agri-text-muted)" />{t("nearby.availability")}</label>
        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-(--agri-border) bg-(--agri-surface-subtle) px-3 py-2 transition-colors hover:bg-(--agri-hover)">
          <input type="checkbox" checked={Boolean(filters.showUnavailable)} onChange={(event) => onChange("showUnavailable", event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-(--agri-input-border) accent-[#2D6A4F]" />
          <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-(--agri-text)">{t("nearby.showUnavailable")}</span><span className="block text-[10px] font-medium text-(--agri-text-muted)">{t("nearby.showUnavailableHint")}</span></span>
          <span className="shrink-0 rounded-full border border-(--agri-border-subtle) bg-(--agri-hover) px-1.5 py-0.5 text-[10px] font-bold text-(--agri-text-muted)">{filters.showUnavailable ? t("nearby.shown") : t("nearby.hidden")}</span>
        </label>
      </div>
    </div>
  );

  if (mobile) return content;
  
  return (
    <aside
      aria-hidden={!visible}
      className={`hidden shrink-0 overflow-hidden transition-[width,opacity,transform] duration-200 ease-out lg:block ${visible ? "w-72 translate-x-0 opacity-100" : "pointer-events-none w-0 -translate-x-2 opacity-0"}`}
    >
      <div className="sticky z-20 max-h-[calc(100vh-var(--marketplace-search-h)-0.75rem)] overflow-y-auto rounded-2xl border border-(--agri-border) bg-(--agri-card) p-5 shadow-md scrollbar-none" style={{ top: "calc(var(--marketplace-search-h) + 0.75rem)" }}>
        {content}
      </div>
    </aside>
  );
}
