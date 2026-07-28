export default function ProductsToolbar({
  total,
  sort,
  onSort,
  onOpenFilters,
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <span className="text-sm font-semibold text-gray-700">
        {total} product{total !== 1 && "s"}
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenFilters}
          className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border rounded-xl font-semibold"
        >
          <i className="ri-filter-3-line text-[#2D6A4F]" />
          Filters
        </button>

        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="bg-white px-3 py-2 border rounded-xl font-semibold outline-none"
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
