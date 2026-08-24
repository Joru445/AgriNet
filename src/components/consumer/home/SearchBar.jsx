export default function SearchBar({ value, onChange }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-2xl p-2 border-2 border-gray-200 shadow-sm focus-within:border-[#2D6A4F] focus-within:ring-2 focus-within:ring-[#2D6A4F]/20 transition-all">
        <div className="flex-1 flex items-center gap-3 px-3.5">
          <i className="ri-search-line text-[#2D6A4F] text-lg" />

          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search products, farmers..."
            className="flex-1 py-2.5 text-sm text-gray-800 placeholder-gray-400 font-medium focus:outline-none bg-transparent"
          />

          {value && (
            <button
              onClick={() => onChange("")}
              className="text-gray-400 hover:text-gray-700"
            >
              <i className="ri-close-line text-lg" />
            </button>
          )}

          <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-green-50 rounded-xl border border-green-200">
            <i className="ri-map-pin-line text-[#2D6A4F]" />

            <span className="text-sm font-bold text-[#2D6A4F]">
              Lucena City
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
