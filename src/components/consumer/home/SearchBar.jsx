export default function SearchBar({ value, onChange }) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-2xl p-2 border-2 border-[#D6E6DC] shadow-xs focus-within:border-[#2D6A4F] focus-within:shadow-md focus-within:ring-3 focus-within:ring-[#2D6A4F]/15 transition-all">
        <div className="flex-1 flex items-center gap-3 px-3.5">
          <i className="ri-search-line text-[#2D6A4F] text-xl font-bold" />

          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search farm fresh produce, crops, organic fruits, farmers..."
            className="flex-1 py-2.5 text-sm sm:text-base text-gray-800 placeholder-gray-400 font-medium focus:outline-none bg-transparent"
          />

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              title="Clear search"
            >
              <i className="ri-close-circle-fill text-lg text-gray-400 hover:text-gray-600" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-[#E8F5EE] rounded-xl border border-[#CDE5D5]">
            <i className="ri-map-pin-2-fill text-[#2D6A4F] text-base" />
            <span className="text-sm sm:text-base font-bold text-[#1B4332]">
              Lucena City
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
