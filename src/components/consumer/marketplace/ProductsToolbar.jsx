export default function ProductsToolbar({
  total = 0,
  loading = false,
  sort,
  onSort,
  onOpenFilters,
}) {
  return (
    <div className="flex items-center justify-betweenaw">
      {/* Product Count */}
      {loading ? (
        <span className="inline-block h-5 w-24 bg-gray-200 rounded-md animate-pulse" />
      ) : (
        <span className="text-sm font-semibold text-gray-700">
          {total} product{total !== 1 ? "s" : ""}
        </span>
      )}

      <div className="flex items-center gap-2 ml-auto">
        {/* Mobile Filters */}
        <button
          type="button"
          onClick={onOpenFilters}
          className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-xs sm:text-sm rounded-xl font-semibold cursor-pointer"
        >
          <i className="ri-filter-3-line text-[#2D6A4F]" />
          <span>Filters</span>
        </button>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="bg-white px-3 py-2 border border-gray-200 rounded-xl font-semibold outline-none text-xs sm:text-sm cursor-pointer"
        >
          <option value="relevant">Relevant</option>
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
    </div>
  );
}
