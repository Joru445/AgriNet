export default function FiltersSidebar({
  filters,
  onChange,
  onReset,
  mobile = false,
}) {
  const hasActiveFilters =
    Boolean(filters.search) ||
    (filters.category && filters.category !== "All") ||
    filters.distance < 10 ||
    filters.minPrice > 0 ||
    filters.maxPrice > 0 ||
    filters.rating > 0 ||
    Boolean(filters.showUnavailable);

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--agri-border)]">
        <h3 className="font-bold text-[#1B4332] dark:text-[var(--agri-brand-light)] flex items-center gap-2 text-base">
          <i className="ri-filter-3-line text-[#2D6A4F] dark:text-[var(--agri-brand)] text-lg" />
          Filters
        </h3>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Distance Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[var(--agri-text)] flex items-center gap-1.5">
            <i className="ri-map-pin-range-line text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
            Distance: {filters.distance} km
          </label>
        </div>

        <input
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={filters.distance}
          onChange={(e) => onChange("distance", Number(e.target.value))}
          className="w-full accent-[#2D6A4F] cursor-pointer"
        />

        <div className="flex justify-between text-xs text-[var(--agri-text-muted)] mt-1">
          <span>0.5 km</span>
          <span>5 km</span>
          <span>10 km</span>
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block mb-2 text-xs font-bold text-[var(--agri-text)] flex items-center gap-1.5">
          <i className="ri-money-dollar-circle-line text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
          Price Range
        </label>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--agri-text-muted)]">
              ₱
            </span>
            <input
              type="number"
              min="0"
              value={filters.minPrice > 0 ? filters.minPrice : ""}
              onChange={(e) =>
                onChange("minPrice", Math.max(0, Number(e.target.value) || 0))
              }
              className="w-full border border-[var(--agri-border)] rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-[#2D6A4F]"
              placeholder="0 (Min)"
            />
          </div>

          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--agri-text-muted)]">
              ₱
            </span>
            <input
              type="number"
              min="0"
              value={filters.maxPrice > 0 ? filters.maxPrice : ""}
              onChange={(e) =>
                onChange("maxPrice", Math.max(0, Number(e.target.value) || 0))
              }
              className="w-full border border-[var(--agri-border)] rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-[#2D6A4F]"
              placeholder="0 (Max)"
            />
          </div>
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <label className="block mb-2 text-xs font-bold text-[var(--agri-text)] flex items-center gap-1.5">
          <i className="ri-star-smile-line text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
          Minimum Rating
        </label>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() =>
                onChange("rating", filters.rating >= rating ? rating - 1 : rating)
              }
              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                filters.rating >= rating
                  ? "bg-amber-50 border-amber-400 text-amber-500 shadow-xs"
                  : "border-[var(--agri-border)] text-[var(--agri-text-muted)] hover:border-amber-300 hover:text-amber-400 bg-[var(--agri-card)]"
              }`}
            >
              <i className="ri-star-fill text-sm" />
            </button>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div className="pt-4 border-t border-[var(--agri-border)]">
        <label className="block mb-2 text-xs font-bold text-[var(--agri-text)] flex items-center gap-1.5">
          <i className="ri-inbox-archive-line text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
          Availability
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--agri-border)] bg-[#F9FBF9] dark:bg-[var(--agri-surface)] hover:bg-[#F0F7F4] dark:hover:bg-[var(--agri-brand-bg)] hover:border-[#2D6A4F]/40 transition-all cursor-pointer select-none">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="show-unavailable-checkbox"
              checked={Boolean(filters.showUnavailable)}
              onChange={(e) => onChange("showUnavailable", e.target.checked)}
              className="w-4 h-4 rounded border-[var(--agri-border)] text-[#2D6A4F] dark:text-[var(--agri-brand)] accent-[#2D6A4F] focus:ring-[#2D6A4F] cursor-pointer"
            />
            <div>
              <span className="block text-xs font-bold text-[var(--agri-text)]">
                Show Unavailable
              </span>
              <span className="block text-[10px] text-[var(--agri-text-muted)] font-medium">
                Include out-of-stock items
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
              filters.showUnavailable
                ? "bg-amber-100 text-amber-800"
                : "bg-[var(--agri-hover)] text-[var(--agri-text-muted)]"
            }`}
          >
            {filters.showUnavailable ? "Shown" : "Hidden"}
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
      <div className="bg-[var(--agri-card)] rounded-2xl border border-[var(--agri-border)] shadow-md p-5 sticky top-24">
        {content}
      </div>
    </aside>
  );
}
