import ProductGrid from "./ProductGrid";
import EmptyProducts from "../home/EmptyProducts";
import ProductPagination from "../home/ProductPagination";

export default function ProductsContainer({
  products = [],

  page,
  totalPages,
  onPageChange,

  hasMore,
  loadingMore,
  onLoadMore,
}) {
  const hasProducts = products.length > 0;

  if (!hasProducts) {
    return <EmptyProducts />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Product Results */}
      <ProductGrid products={products} hasActiveFilter />

      {/* Pagination */}
      {totalPages > 1 && (
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
            className="
              rounded-2xl
              border-2
              border-[#2D6A4F]
              bg-[var(--agri-card)]
              px-6
              py-3
              text-sm
              font-bold
              text-[#2D6A4F] dark:text-[var(--agri-brand)]
              transition-all
              hover:bg-[#E8F5EE] dark:hover:bg-[var(--agri-brand-bg-alt)]
              disabled:cursor-not-allowed
              disabled:opacity-50
              cursor-pointer
              shadow-xs
            "
          >
            {loadingMore
              ? "Loading more produce..."
              : "Load More Products"}
          </button>
        </div>
      )}
    </div>
  );
}