import NearYouSection from "./NearYouSection";
import RecentProductsSection from "./RecentProductsSection";
import ProductGrid from "./ProductGrid";
import EmptyProducts from "./EmptyProducts";
import ProductPagination from "./ProductPagination";

export default function ProductsContainer({
  products = [],
  filteredProducts = [],
  hasActiveFilter = false,

  userLocation,

  page,
  totalPages,
  onPageChange,

  hasMore,
  loadingMore,
  onLoadMore,
}) {
  const showDiscoverySections = !hasActiveFilter;
  const hasProducts = products.length > 0;
  const hasFilteredProducts = filteredProducts.length > 0;

  return hasProducts ? (
    <div className="flex flex-col gap-6">
      {/* Discovery Sections */}
      {showDiscoverySections && (
        <>
          <NearYouSection products={products} userLocation={userLocation} />

          <RecentProductsSection products={products} />
        </>
      )}

      {/* Product Results */}
      {hasFilteredProducts && (
        <ProductGrid
          products={filteredProducts}
          hasActiveFilter={hasActiveFilter}
        />
      )}

      {/* Pagination */}
      {hasFilteredProducts && totalPages > 1 && (
        <ProductPagination
          page={page}
          totalPages={totalPages}
          onChange={onPageChange}
        />
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="rounded-2xl border-2 border-[#2D6A4F] bg-white px-6 py-3 text-sm font-bold text-[#2D6A4F] transition-all hover:bg-[#E8F5EE] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {loadingMore ? "Loading more produce..." : "Load More Products"}
          </button>
        </div>
      )}
    </div>
  ) : (
    <EmptyProducts />
  );
}
