export default function FiltersSidebar({
  filters,
  onChange,
  onReset,
  mobile = false,
}) {
  if (mobile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 mb-5 border-b">
          <h3 className="font-bold text-[#1B4332] flex items-center gap-2">
            <i className="ri-filter-3-line text-[#2D6A4F]" />
            Filters
          </h3>

          <button
            onClick={onReset}
            className="text-xs font-bold text-[#2D6A4F] hover:underline"
          >
            Reset All
          </button>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-xs font-bold">
            Distance: {filters.distance} km
          </label>

          <input
            type="range"
            min={0.1}
            max={10}
            step={0.1}
            value={filters.distance}
            onChange={(e) => onChange("distance", Number(e.target.value))}
            className="w-full accent-[#2D6A4F]"
          />

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1 km</span>
            <span>10 km</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-xs font-bold">Price Range</label>

          <div className="flex gap-2">
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => onChange("minPrice", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Min"
            />

            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => onChange("maxPrice", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Max"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-xs font-bold">Minimum Rating</label>

          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => onChange("rating", rating)}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition ${
                  filters.rating >= rating
                    ? "bg-amber-50 border-amber-400 text-amber-500"
                    : "border-gray-200 text-gray-400 hover:border-amber-400"
                }`}
              >
                <i className="ri-star-fill" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden lg:block lg:w-72 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
        <div className="flex items-center justify-between pb-3 mb-5 border-b">
          <h3 className="font-bold text-[#1B4332] flex items-center gap-2">
            <i className="ri-filter-3-line text-[#2D6A4F]" />
            Filters
          </h3>

          <button
            onClick={onReset}
            className="text-xs font-bold text-[#2D6A4F] hover:underline"
          >
            Reset All
          </button>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-xs font-bold">
            Distance: {filters.distance} km
          </label>

          <input
            type="range"
            min={0.1}
            max={10}
            step={0.1}
            value={filters.distance}
            onChange={(e) => onChange("distance", Number(e.target.value))}
            className="w-full accent-[#2D6A4F]"
          />

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1 km</span>
            <span>10 km</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-xs font-bold">Price Range</label>

          <div className="flex gap-2">
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => onChange("minPrice", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Min"
            />

            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => onChange("maxPrice", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Max"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-xs font-bold">Minimum Rating</label>

          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => onChange("rating", rating)}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition ${
                  filters.rating >= rating
                    ? "bg-amber-50 border-amber-400 text-amber-500"
                    : "border-gray-200 text-gray-400 hover:border-amber-400"
                }`}
              >
                <i className="ri-star-fill" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
