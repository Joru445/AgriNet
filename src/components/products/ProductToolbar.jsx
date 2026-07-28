export default function ProductToolbar({
  view,
  search,
  onSearch,
  onViewChange,
  onAdd,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B4332]">My Products</h2>

        <p className="text-sm text-gray-500">
          Manage your agricultural product listings
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 border rounded-xl border-gray-200 focus:border-[#2D6A4F] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewChange("grid")}
              className={`px-3 py-2 rounded-md transition ${
                view === "grid"
                  ? "bg-white shadow text-[#2D6A4F]"
                  : "text-gray-500"
              }`}
            >
              <i className="ri-grid-line" />
            </button>

            <button
              onClick={() => onViewChange("list")}
              className={`px-3 py-2 rounded-md transition ${
                view === "list"
                  ? "bg-white shadow text-[#2D6A4F]"
                  : "text-gray-500"
              }`}
            >
              <i className="ri-list-check" />
            </button>
          </div>

          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-semibold"
          >
            <i className="ri-add-line" />
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}
