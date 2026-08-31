import useMarketplace from "../../hooks/useMarketplace";

import CategoryChips from "../../components/consumer/layout/CategoryChips";
import FiltersSidebar from "../../components/consumer/marketplace/FiltersSidebar";
import MobileFiltersDrawer from "../../components/consumer/marketplace/MobileFiltersDrawer";
import ProductsToolbar from "../../components/consumer/marketplace/ProductsToolbar";
import ProductsContainer from "../../components/consumer/marketplace/ProductsContainer";

import ProductGridSkeleton from "../../components/consumer/marketplace/MarketplaceSkeleton";
import MarketplaceSubHeader from "../../components/consumer/layout/MarketplaceSubHeader";

export default function Marketplace() {
  const {
    loading,
    products,
    filteredProducts,
    totalProducts,

    filters,
    hasActiveFilters,
    updateFilter,
    resetFilters,

    page,
    setPage,
    totalPages,

    hasMore,
    loadingMore,
    loadMore,

    showFilters,
    setShowFilters,
  } = useMarketplace();

  return (
    <>
      <main className="max-w-6xl mx-auto pb-8 space-y-4">
        <MarketplaceSubHeader
          searchValue={filters.search}
          onSearchChange={(value) => updateFilter("search", value)}
        />

        <CategoryChips
          value={filters.category}
          onChange={(value) => updateFilter("category", value)}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <FiltersSidebar
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
          />

          <section className="min-w-0 flex-1 space-y-4 px-2">
            <ProductsToolbar
              total={totalProducts}
              loading={loading}
              sort={filters.sort}
              onSort={(value) => updateFilter("sort", value)}
              onOpenFilters={() => setShowFilters(true)}
              hasActiveFilters={hasActiveFilters}
            />

            {loading ? (
              <ProductGridSkeleton />
            ) : (
              <ProductsContainer
                products={products}
                filteredProducts={filteredProducts}
                hasActiveFilter={hasActiveFilters}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={loadMore}
              />
            )}
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
