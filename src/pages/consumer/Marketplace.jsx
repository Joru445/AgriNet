import { useEffect, useRef } from "react";

import useMarketplace from "../../hooks/useMarketplace";

import CategoryChips from "../../components/consumer/layout/CategoryChips";
import FiltersSidebar from "../../components/consumer/marketplace/FiltersSidebar";
import MobileFiltersDrawer from "../../components/consumer/marketplace/MobileFiltersDrawer";
import ProductsToolbar from "../../components/consumer/marketplace/ProductsToolbar";
import ProductGrid from "../../components/consumer/marketplace/ProductGrid";
import DiscoverySection from "../../components/consumer/marketplace/DiscoverySection";
import EmptyState from "../../components/ui/EmptyState";

import {
  NearYouSkeleton,
  RecentProductsSkeleton,
  RelevantProductsSkeleton,
} from "../../components/consumer/marketplace/SectionSkeletons";
import ProductGridSkeleton from "../../components/products/ProductGridSkeleton";
import ProductLoadError from "../../components/products/ProductLoadError";
import MarketplaceSubHeader from "../../components/consumer/layout/MarketplaceSubHeader";

const DISCOVERY_GRID =
  "grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4";

const RECOMMENDED_GRID =
  "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5 gap-3 sm:gap-4";

const LOAD_MORE_GRID =
  "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6";

export default function Marketplace() {
  const {
    loading,
    error,
    filteredProducts,
    totalProducts,

    filters,
    hasActiveFilters,
    updateFilter,
    resetFilters,

    showFilters,
    setShowFilters,
    reloadProducts,

    // Discovery sections
    nearbyProducts,
    recentProducts,
    relevantProducts,

    // Infinite scroll
    hasMore,
    loadingMore,
    loadMore,
  } = useMarketplace();

  // ── Infinite scroll sentinel ─────────────────────────────────
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Don't observe if we're still loading initial data or have no more
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, hasMore, loadingMore, loadMore]);

  const showDiscovery = !hasActiveFilters;

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

        <div className="flex flex-col lg:flex-row gap-6 px-2 xl:px-0">
          <FiltersSidebar
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
          />

          <section className="min-w-0 flex-1 space-y-4">
            <ProductsToolbar
              total={totalProducts}
              loading={loading}
              sort={filters.sort}
              onSort={(value) => updateFilter("sort", value)}
              onOpenFilters={() => setShowFilters(true)}
            />

            {loading ? (
              <div className="space-y-8">
                <NearYouSkeleton />
                <RecentProductsSkeleton />
                <RelevantProductsSkeleton />
              </div>
            ) : error ? (
              <ProductLoadError onRetry={reloadProducts} />
            ) : showDiscovery ? (
              /* ── Discovery sections (default state) ─────────────── */
              <div className="space-y-8">
                {nearbyProducts.length > 0 && (
                  <DiscoverySection
                    title="Near You"
                    subtitle="Products from farmers within 5 km"
                  >
                    <ProductGrid
                      products={nearbyProducts}
                      gridClassName={DISCOVERY_GRID}
                    />
                  </DiscoverySection>
                )}

                {recentProducts.length > 0 && (
                  <DiscoverySection
                    title="Recently Added"
                    subtitle="Fresh products from local farmers"
                  >
                    <ProductGrid
                      products={recentProducts}
                      gridClassName={DISCOVERY_GRID}
                    />
                  </DiscoverySection>
                )}

                {relevantProducts.length > 0 && (
                  <DiscoverySection
                    title="Recommended for You"
                    subtitle="Based on ratings, distance, and freshness"
                    alignItems="items-center"
                  >
                    <ProductGrid
                      products={relevantProducts}
                      gridClassName={RECOMMENDED_GRID}
                    />
                  </DiscoverySection>
                )}

                {/* All Products grid with infinite scroll */}
                {filteredProducts.length > 0 && (
                  <DiscoverySection title="All Products">
                    <ProductGrid
                      products={filteredProducts}
                      gridClassName={LOAD_MORE_GRID}
                    />

                    {/* Infinite scroll sentinel */}
                    <div ref={sentinelRef} className="h-1" />

                    {loadingMore && (
                      <ProductGridSkeleton
                        count={4}
                        gridClassName={LOAD_MORE_GRID}
                      />
                    )}

                    {!hasMore && filteredProducts.length > 0 && (
                      <p className="text-center text-sm text-gray-400 py-4">
                        No more products
                      </p>
                    )}
                  </DiscoverySection>
                )}
              </div>
            ) : (
              /* ── Filtered/search results ────────────────────────── */
              <div className="flex flex-col gap-6">
                <ProductGrid products={filteredProducts} />

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="h-1" />

                {loadingMore && (
                  <ProductGridSkeleton
                    count={4}
                    gridClassName={LOAD_MORE_GRID}
                  />
                )}

                {!hasMore && filteredProducts.length > 0 && (
                  <p className="text-center text-sm text-gray-400 py-4">
                    No more products
                  </p>
                )}

                {filteredProducts.length === 0 && (
                  <EmptyState
                    icon="ri-shopping-basket-2-line"
                    title="No products found"
                    description="Try adjusting your filters or search terms"
                  />
                )}
              </div>
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
