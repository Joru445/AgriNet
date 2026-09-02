import { useLanguage } from "../../../context/LanguageContext";

export default function ProductToolbar({
  view,
  search,
  onSearch,
  onViewChange,
  onAdd,
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B4332] dark:text-(--agri-brand-light)">{t("products.myProducts")}</h2>

        <p className="text-sm font-medium text-(--agri-text-muted)">
          {t("products.myProductsDesc")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar (Matching Consumer Home Page Style) */}
        <div className="relative flex-1 sm:w-72 flex items-center gap-2 bg-(--agri-card) rounded-xl px-3 py-1.5 border-2 border-[#D6E6DC] shadow-xs focus-within:border-[#2D6A4F] focus-within:shadow-md focus-within:ring-3 focus-within:ring-[#2D6A4F]/15 transition-all">
          <i className="ri-search-line text-[#2D6A4F] dark:text-(--agri-brand) text-lg font-bold shrink-0" />

          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t("products.searchPlaceholder")}
            className="w-full text-sm font-semibold text-(--agri-text) placeholder-gray-400 focus:outline-none bg-transparent"
          />

          {search && (
            <button
              type="button"
              onClick={() => onSearch("")}
              className="p-0.5 rounded-full text-[var(--agri-text-muted)] hover:text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition cursor-pointer"
              title={t("common.cancel")}
            >
              <i className="ri-close-circle-fill text-base text-[var(--agri-text-muted)] hover:text-[var(--agri-text-secondary)]" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 justify-between sm:justify-start">
          {/* Grid / List View Toggle (High contrast & readable) */}
          <div className="flex bg-[var(--agri-card)] border-2 border-[#D6E6DC] rounded-xl p-1 shadow-xs items-center gap-1">
            <button
              type="button"
              onClick={() => onViewChange("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                view === "grid"
                  ? "bg-[#E8F5EE] dark:bg-[var(--agri-brand-bg-alt)] border border-[#BBDAC4] text-[#1B4332] dark:text-[var(--agri-brand-light)] shadow-xs"
                  : "text-[var(--agri-text-muted)] hover:text-[var(--agri-text)] hover:bg-[var(--agri-hover)]"
              }`}
              title={t("products.grid")}
            >
              <i className="ri-grid-fill text-sm text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
              <span className="hidden sm:inline">{t("products.grid")}</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                view === "list"
                  ? "bg-[#E8F5EE] dark:bg-[var(--agri-brand-bg-alt)] border border-[#BBDAC4] text-[#1B4332] dark:text-[var(--agri-brand-light)] shadow-xs"
                  : "text-[var(--agri-text-muted)] hover:text-[var(--agri-text)] hover:bg-[var(--agri-hover)]"
              }`}
              title={t("products.list")}
            >
              <i className="ri-list-check text-sm text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
              <span className="hidden sm:inline">{t("products.list")}</span>
            </button>
          </div>

          {/* Add Product Button */}
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-sm shadow-sm hover:shadow-md transition cursor-pointer shrink-0"
          >
            <i className="ri-add-line text-lg font-bold" />
            <span>{t("products.addProduct")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
