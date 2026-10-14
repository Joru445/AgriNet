import { useCallback, useEffect, useRef, useState } from "react";

import useMarketplace from "../../hooks/useMarketplace";
import usePullToRefresh from "../../hooks/usePullToRefresh";

import { showToast } from "../../utils/toast";
import { useLanguage } from "../../context/LanguageContext";

import useMediaQuery from "../../hooks/useMediaQuery";

import CategoryChips from "../../components/consumer/layout/CategoryChips";
import MarketplaceSubHeader from "../../components/consumer/layout/MarketplaceSubHeader";
import FiltersSidebar from "../../components/consumer/marketplace/FiltersSidebar";
import MobileFiltersDrawer from "../../components/consumer/marketplace/MobileFiltersDrawer";
import ProductsToolbar from "../../components/consumer/marketplace/ProductsToolbar";
import ProductGrid from "../../components/consumer/marketplace/ProductGrid";
import ProductGridSkeleton from "../../components/products/ProductGridSkeleton";
import ProductLoadError from "../../components/products/ProductLoadError";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

export default function Marketplace() {
  const { t } = useLanguage();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [desktopFiltersVisible, setDesktopFiltersVisible] = useState(true);
  const [masonryColumns, setMasonryColumns] = useState(2);
  const [enteringIds, setEnteringIds] = useState(new Set());
  const previousIdsRef = useRef(new Set());
  const gridRef = useRef(null);
  const sentinelRef = useRef(null);
  const {
    loading,
    loadingMore,
    refreshing,
    error,
    filters,
    visibleProducts,
    filteredProducts,
    totalProducts,
    hasMore,
    showFilters,
    setShowFilters,
    updateFilter,
    hasActiveFilters,
    setColumns,
    revealNextRow,
    reloadProducts,
    refreshProducts,
    resetFilters,
  } = useMarketplace();

  const handleRefresh = useCallback(async () => {
    const refreshed = await refreshProducts();
    if (!refreshed) showToast.error(t("marketplace.refreshFailed"));
  }, [refreshProducts, t]);
  const { pullDistance } = usePullToRefresh(
    handleRefresh,
    !refreshing && !loading,
  );

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || typeof ResizeObserver === "undefined") return undefined;
    const updateColumns = () => {
      const nextColumns = Math.max(
        2,
        Math.min(6, Math.floor((grid.clientWidth + 12) / 172)),
      );
      setMasonryColumns(nextColumns);
      setColumns(nextColumns);
    };
    const observer = new ResizeObserver(updateColumns);
    observer.observe(grid);
    updateColumns();
    return () => observer.disconnect();
  }, [setColumns]);

  useEffect(() => {
    const known = previousIdsRef.current;
    const added = visibleProducts
      .filter((product) => !known.has(product.id))
      .map((product) => product.id);
    if (added.length) {
      setEnteringIds(new Set(added));
      const timer = window.setTimeout(() => setEnteringIds(new Set()), 900);
      previousIdsRef.current = new Set(
        visibleProducts.map((product) => product.id),
      );
      return () => window.clearTimeout(timer);
    }
    previousIdsRef.current = new Set(
      visibleProducts.map((product) => product.id),
    );
    return undefined;
  }, [visibleProducts]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (
      !sentinel ||
      loading ||
      loadingMore ||
      (!hasMore && visibleProducts.length >= filteredProducts.length)
    )
      return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) revealNextRow();
      },
      { rootMargin: "320px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    filteredProducts.length,
    hasMore,
    loading,
    loadingMore,
    revealNextRow,
    visibleProducts.length,
  ]);

  const openFilters = () =>
    isDesktop
      ? setDesktopFiltersVisible((visible) => !visible)
      : setShowFilters(true);
  const removeFilter = (key) =>
    updateFilter(
      key,
      key === "category"
        ? "All"
        : key === "sellingMode"
          ? "all"
          : key === "group"
            ? ""
            : key === "distance"
              ? 10
              : key === "showUnavailable"
                ? false
                : 0,
    );

  return (
    <main
      data-marketplace-root
      className="mx-auto w-full min-w-0 max-w-7xl space-y-4 pb-8"
    >
      {(pullDistance > 0 || refreshing) && (
        <div
          className="pointer-events-none sticky top-0 z-50 flex justify-center"
          role="status"
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-full border border-(--agri-border) bg-(--agri-card) shadow-md"
            style={{ transform: `translateY(${Math.min(pullDistance, 36)}px)` }}
          >
            <i
              className={`ri-refresh-line text-[#2D6A4F] dark:text-(--agri-brand) ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="sr-only">
              {refreshing
                ? t("marketplace.refreshingProducts")
                : t("marketplace.releaseToRefresh")}
            </span>
          </span>
        </div>
      )}
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
      <div className="flex gap-5 px-2 xl:px-0">
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
            filters={filters}
            onRemoveFilter={removeFilter}
            onClearFilters={resetFilters}
          />
          {loading && !visibleProducts.length ? (
            <ProductGridSkeleton count={masonryColumns} columns={masonryColumns} />
          ) : null}
          {error && !visibleProducts.length ? (
            <ProductLoadError onRetry={reloadProducts} />
          ) : null}
          {!loading && !error && !visibleProducts.length && !hasMore ? (
            <EmptyState
              icon="ri-shopping-basket-2-line"
              title={t("marketplace.noProductsFound")}
              description={t("marketplace.noProductsFoundDescription")}
              action={hasActiveFilters ? t("marketplace.clearAll") : undefined}
              onAction={hasActiveFilters ? resetFilters : undefined}
            />
          ) : null}
          {visibleProducts.length > 0 && (
            <ProductGrid
              products={visibleProducts}
              gridRef={gridRef}
              columns={masonryColumns}
              enteringIds={enteringIds}
            />
          )}
          {loadingMore ? (
            <ProductGridSkeleton
              count={Math.max(2, Math.min(masonryColumns, visibleProducts.length || 2))}
              columns={masonryColumns}
            />
          ) : null}
          {error && visibleProducts.length > 0 ? (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                size="sm"
                icon="ri-refresh-line"
                onClick={() => revealNextRow()}
              >
                {t("ui.retry")}
              </Button>
            </div>
          ) : null}
          <div ref={sentinelRef} className="h-px" aria-hidden="true" />
          {!hasMore &&
          visibleProducts.length > 0 &&
          visibleProducts.length >= filteredProducts.length ? (
            <p className="py-3 text-center text-xs font-medium text-(--agri-text-muted)">
              {t("marketplace.endOfResults")}
            </p>
          ) : null}
        </section>
      </div>
      <MobileFiltersDrawer
        open={showFilters}
        filters={filters}
        onChange={updateFilter}
        onReset={resetFilters}
        onClose={() => setShowFilters(false)}
      />
    </main>
  );
}
