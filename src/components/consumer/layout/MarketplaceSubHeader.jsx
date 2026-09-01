import SearchBar from "../../common/SearchBar";

export default function MarketplaceSubHeader({
  searchValue,
  onSearchChange,
  onSearchSubmit,
}) {
  return (
    <div className="sticky top-0 z-9996 bg-[var(--agri-page)]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 space-y-2">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
        />
      </div>
    </div>
  );
}