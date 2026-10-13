import { useEffect, useRef, useState } from "react";

import useMarketplace from "../../hooks/useMarketplace";
import usePullToRefresh from "../../hooks/usePullToRefresh";
import { showToast } from "../../utils/toast";
import { useCallback } from "react";
import { useLanguage } from "../../context/LanguageContext";
import useMediaQuery from "../../hooks/useMediaQuery";

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
  const { t } = useLanguage();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [desktopFiltersVisible, setDesktopFiltersVisible] = useState(true);
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
    refreshProducts,
    refreshing,
    lastRefreshedAt,

    // Discovery sections
    nearbyProducts,
    recentProducts,
    relevantProducts,

    // Infinite scroll
    hasMore,
    loadingMore,
    loadMore,
  } = useMarketplace();

  const handleRefresh = useCallback(async () => {
    try {
      await refreshProducts();
      showToast.success(t("marketplace.productsUpToDate"));
    } catch (error) {
      showToast.error(error?.message || t("marketplace.refreshFailed"));
    }
  }, [refreshProducts, t]);
  const { pullDistance } = usePullToRefresh(handleRefresh, !refreshing && !loading);

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
  const openFilters = () => {
    if (isDesktop) setDesktopFiltersVisible((visible) => !visible);
    else setShowFilters(true);
  };

  return (
    <>
      <main data-marketplace-root className="w-full min-w-0 max-w-6xl mx-auto pb-8 space-y-4">
        {(pullDistance > 0 || refreshing) && <div className="sticky top-0 z-30 flex justify-center pointer-events-none" role="status">
          <span className="rounded-b-xl border border-(--agri-border) bg-(--agri-card) px-4 py-2 text-xs font-bold text-(--agri-text) shadow" style={{ transform: `translateY(${Math.min(pullDistance, 40)}px)` }}>
            <i className={`ri-refresh-line mr-2 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? t("marketplace.refreshingProducts") : pullDistance >= 72 ? t("marketplace.releaseToRefresh") : t("marketplace.pullToRefresh")}
          </span>
        </div>}
        <MarketplaceSubHeader
          searchValue={filters.search}
          onSearchChange={(value) => updateFilter("search", value)}
          onOpenFilters={openFilters}
          filtersActive={hasActiveFilters || (isDesktop && desktopFiltersVisible)}
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
            visible={desktopFiltersVisible}
          />

          <section className="min-w-0 flex-1 space-y-4">
            <ProductsToolbar
              total={totalProducts}
              loading={loading}
              sort={filters.sort}
              onSort={(value) => updateFilter("sort", value)}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              lastRefreshedAt={lastRefreshedAt}
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
                    title={t("marketplace.nearYou")}
                    subtitle={t("marketplace.nearYouSubtitle")}
                  >
                    <ProductGrid
                      products={nearbyProducts}
                      gridClassName={DISCOVERY_GRID}
                    />
                  </DiscoverySection>
                )}

                {recentProducts.length > 0 && (
                  <DiscoverySection
                    title={t("marketplace.recentlyAdded")}
                    subtitle={t("marketplace.recentlyAddedSubtitle")}
                  >
                    <ProductGrid
                      products={recentProducts}
                      gridClassName={DISCOVERY_GRID}
                    />
                  </DiscoverySection>
                )}

                {relevantProducts.length > 0 && (
                  <DiscoverySection
                    title={t("marketplace.recommended")}
                    subtitle={t("marketplace.recommendedSubtitle")}
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
                  <DiscoverySection title={t("marketplace.allProducts")}>
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
                        {t("marketplace.noMoreProducts")}
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
                    {t("marketplace.noMoreProducts")}
                  </p>
                )}

                {filteredProducts.length === 0 && (
                  <EmptyState
                    icon="ri-shopping-basket-2-line"
                    title={t("marketplace.noProductsFound")}
                    description={t("marketplace.noProductsFoundDescription")}
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
