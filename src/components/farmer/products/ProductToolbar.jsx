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

        <p className="text-sm font-medium text-gray-500">
          Manage and list your farm harvest products
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar (Matching Consumer Home Page Style) */}
        <div className="relative flex-1 sm:w-72 flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border-2 border-[#D6E6DC] shadow-xs focus-within:border-[#2D6A4F] focus-within:shadow-md focus-within:ring-3 focus-within:ring-[#2D6A4F]/15 transition-all">
          <i className="ri-search-line text-[#2D6A4F] text-lg font-bold shrink-0" />

          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search my products..."
            className="w-full text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
          />

          {search && (
            <button
              type="button"
              onClick={() => onSearch("")}
              className="p-0.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              title="Clear search"
            >
              <i className="ri-close-circle-fill text-base text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 justify-between sm:justify-start">
          {/* Grid / List View Toggle (High contrast & readable) */}
          <div className="flex bg-white border-2 border-[#D6E6DC] rounded-xl p-1 shadow-xs items-center gap-1">
            <button
              type="button"
              onClick={() => onViewChange("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                view === "grid"
                  ? "bg-[#E8F5EE] border border-[#BBDAC4] text-[#1B4332] shadow-xs"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
              title="Grid View"
            >
              <i className="ri-grid-fill text-sm text-[#2D6A4F]" />
              <span className="hidden sm:inline">Grid</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                view === "list"
                  ? "bg-[#E8F5EE] border border-[#BBDAC4] text-[#1B4332] shadow-xs"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
              title="List View"
            >
              <i className="ri-list-check text-sm text-[#2D6A4F]" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {/* Add Product Button */}
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-sm shadow-sm hover:shadow-md transition cursor-pointer shrink-0"
          >
            <i className="ri-add-line text-lg font-bold" />
            <span>Add Product</span>
          </button>
        </div>
      </div>
    </div>
  );
}
