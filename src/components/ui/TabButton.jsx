export default function TabButton({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
        active
          ? "bg-[var(--agri-card)] text-[#2D6A4F] dark:text-[var(--agri-brand)] shadow-2xs"
          : "text-[var(--agri-text-muted)] hover:text-[var(--agri-text-secondary)]"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className="ml-1 text-[10px] opacity-70">({count})</span>
      )}
    </button>
  );
}
