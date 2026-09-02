import SearchBar from "../../common/SearchBar";

export default function MarketplaceSubHeader({
  searchValue,
  onSearchChange,
  onSearchSubmit,
}) {
  return (
    <div data-onboarding="home-search" className="sticky top-0 z-9996 bg-(--agri-page)/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-0 py-3 space-y-2">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
        />
      </div>
    </div>
  );
}