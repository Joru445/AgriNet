import useMarketplace from "../../hooks/useMarketplace";

import SearchBar from "../../components/home/SearchBar";
import CategoryChips from "../../components/home/CategoryChips";
import FiltersSidebar from "../../components/home/FiltersSidebar";
import MobileFiltersDrawer from "../../components/home/MobileFiltersDrawer";
import ProductsToolbar from "../../components/home/ProductsToolbar";
import ProductGrid from "../../components/home/ProductGrid";
import ProductPagination from "../../components/home/ProductPagination";
import MarketplaceSkeleton from "../../components/home/MarketplaceSkeleton";

export default function Home() {
  const {
    loading,

    filteredProducts,
    totalProducts,

    filters,
    updateFilter,
    resetFilters,

    page,
    setPage,
    totalPages,

    showFilters,
    setShowFilters,
  } = useMarketplace();

  if (loading) {
    return (
      <main className="px-4 py-8 md:px-8 pb-16 md:pb-8">
        <MarketplaceSkeleton />
      </main>
    );
  }

  return (
    <>
      <main className="px-4 py-8 md:px-8 pb-16 md:pb-0">
        <SearchBar
          value={filters.search}
          onChange={(value) => updateFilter("search", value)}
        />

        <CategoryChips
          value={filters.category}
          onChange={(value) => updateFilter("category", value)}
        />

        <div className="mx-auto mt-8 flex max-w-7xl gap-6">
          <FiltersSidebar
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
          />

          <section className="min-w-0 flex-1">
            <ProductsToolbar
              total={totalProducts}
              sort={filters.sort}
              onSort={(value) => updateFilter("sort", value)}
              onOpenFilters={() => setShowFilters(true)}
            />

            <ProductGrid products={filteredProducts} />

            <ProductPagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </section>
        </div>
      </main>

      <MobileFiltersDrawer
        open={showFilters}
        filters={filters}
        onChange={updateFilter}
        onReset={resetFilters}
        onClose={() => setShowFilters(false)}
      />
    </>
  );
}
