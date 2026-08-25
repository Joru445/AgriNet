export default function ReportFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}) {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200/90 bg-white p-4.5 shadow-md shadow-black/5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Searchbar */}
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D6A4F] text-base font-bold" />

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reports by reason, user, target, or explanation..."
            className="w-full rounded-xl border border-gray-200/90 bg-gray-50/50 py-2.5 pl-10 pr-10 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#2D6A4F] focus:bg-white focus:ring-2 focus:ring-[#2D6A4F]/15"
          />

          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <i className="ri-close-circle-fill text-base text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-xl border border-gray-200/90 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition focus:border-[#2D6A4F] focus:bg-white focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>
    </div>
  );
}
