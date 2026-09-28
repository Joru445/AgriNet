export default function InlineSearchInput({
  value,
  onChange,
  placeholder,
  className = "",
}) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D6A4F] dark:text-(--agri-brand) text-base font-bold pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 rounded-xl border border-(--agri-input-border) bg-(--agri-input-bg) py-2.5 pl-10 pr-10 text-sm text-(--agri-text) placeholder:text-(--agri-text-muted) transition-all duration-150 focus:border-[#2D6A4F] dark:focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 dark:focus:ring-emerald-500/25 shadow-2xs"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 rounded-full text-(--agri-text-muted) hover:text-(--agri-text) hover:bg-(--agri-hover) transition"
          aria-label="Clear search"
        >
          <i className="ri-close-circle-fill text-lg" />
        </button>
      )}
    </div>
  );
}
