export default function SearchBar({ value = "", onChange, onSubmit }) {
  function handleSubmit(event) {
    event.preventDefault();

    if (onSubmit) {
      onSubmit(value);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-2xl p-2 border-2 border-[#D6E6DC] shadow-xs focus-within:border-[#2D6A4F] focus-within:shadow-md focus-within:ring-3 focus-within:ring-[#2D6A4F]/15 transition-all">
        <div className="flex-1 flex items-center gap-3 px-3.5">
          <i className="ri-search-line text-[#2D6A4F] text-xl font-bold" />

          <input
            type="search"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder="Search farm fresh produce, crops, organic fruits, farmers..."
            className="
              flex-1
              py-2.5
              text-sm
              sm:text-base
              text-gray-800
              placeholder-gray-400
              font-medium
              focus:outline-none
              bg-transparent
              [&::-webkit-search-cancel-button]:appearance-none
              [&::-webkit-search-decoration]:appearance-none"
          />

          {value && (
            <button
              type="button"
              onClick={() => onChange?.("")}
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
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

          {onSubmit && (
            <button
              type="submit"
              aria-label="Search"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2D6A4F] text-white hover:bg-[#1B4332] transition-colors cursor-pointer"
            >
              <i className="ri-search-line text-lg" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
