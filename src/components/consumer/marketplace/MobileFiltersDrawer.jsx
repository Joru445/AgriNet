import FiltersSidebar from "./FiltersSidebar";

export default function MobileFiltersDrawer({
  open,
  filters,
  onChange,
  onReset,
  onClose,
}) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-9998 bg-black/40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed bottom-0 left-0 right-0 z-9999 rounded-t-3xl bg-[var(--agri-card)] transition-transform duration-300 lg:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--agri-border)] px-5 py-4">
          <h2 className="text-lg font-bold">Filters</h2>

          <button onClick={onClose}>
            <i className="ri-close-line text-2xl" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          <FiltersSidebar
            mobile
            filters={filters}
            onChange={onChange}
            onReset={onReset}
          />
        </div>

        <div className="border-t border-[var(--agri-border)] p-5">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-[#2D6A4F] py-3 font-semibold text-white"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
