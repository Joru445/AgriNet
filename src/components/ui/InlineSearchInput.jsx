export default function InlineSearchInput({
  value,
  onChange,
  placeholder,
  className = "",
}) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D6A4F] text-base font-bold" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] py-2.5 pl-10 pr-10 text-sm text-[var(--agri-text)] placeholder:text-[var(--agri-text-muted)] focus:border-[#2D6A4F] focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--agri-text-muted)] hover:text-[var(--agri-text-secondary)]"
        >
          <i className="ri-close-circle-fill text-lg" />
        </button>
      )}
    </div>
  );
}
