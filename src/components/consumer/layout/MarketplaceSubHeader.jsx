import SearchBar from "../../ui/SearchBar";

export default function MarketplaceSubHeader({
  searchValue,
  onSearchChange,
  onSearchSubmit,
}) {
  return (
    <div data-onboarding="home-search" className="sticky top-0 z-40 bg-(--agri-page)/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-2 xl:px-0 py-2.5">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
        />
      </div>
    </div>
  );
}