import useMarketplace from "../../hooks/useMarketplace";

import SearchBar from "../../components/consumer/home/SearchBar";
import CategoryChips from "../../components/consumer/home/CategoryChips";
import FiltersSidebar from "../../components/consumer/home/FiltersSidebar";
import MobileFiltersDrawer from "../../components/consumer/home/MobileFiltersDrawer";
import ProductsToolbar from "../../components/consumer/home/ProductsToolbar";
import ProductGrid from "../../components/consumer/home/ProductGrid";
import ProductPagination from "../../components/consumer/home/ProductPagination";
import { ProductGridSkeleton } from "../../components/consumer/home/MarketplaceSkeleton";

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

    hasMore,
    loadingMore,
    loadMore,

    showFilters,
    setShowFilters,
  } = useMarketplace();

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 pb-18 md:pb-8 space-y-6">
        {/* Search & Category Filter Section */}
        <section className="space-y-4">
          <SearchBar
            value={filters.search}
            onChange={(value) => updateFilter("search", value)}
          />

          <CategoryChips
            value={filters.category}
            onChange={(value) => updateFilter("category", value)}
          />
        </section>

        {/* Main Products Grid & Filter Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6 pt-2">
          <FiltersSidebar
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
          />

          <section className="min-w-0 flex-1">
            <ProductsToolbar
              total={totalProducts}
              loading={loading}
              sort={filters.sort}
              onSort={(value) => updateFilter("sort", value)}
              onOpenFilters={() => setShowFilters(true)}
            />

            {loading ? (
              <ProductGridSkeleton />
            ) : (
              <>
                <ProductGrid products={filteredProducts} />

                <ProductPagination
                  page={page}
                  totalPages={totalPages}
                  onChange={setPage}
                />

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="rounded-2xl border-2 border-[#2D6A4F] bg-white px-6 py-3 text-sm font-bold text-[#2D6A4F] hover:bg-[#E8F5EE] disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                    >
                      {loadingMore ? "Loading more produce..." : "Load More Products"}
                    </button>
                  </div>
                )}
              </>
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
