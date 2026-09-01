import { Link } from "react-router-dom";
import ProductCard from "../../common/ProductCard";

// Show max 4 products (2 columns × 2 rows)
const MAX_DISPLAY = 4;

export default function RecentProducts({ products = [], loading = false }) {
  const displayedProducts = products.slice(0, MAX_DISPLAY);

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--agri-text)]">Recent Products</h2>
          <p className="text-xs font-medium text-[var(--agri-text-muted)] mt-0.5">
            {loading
              ? "Loading recent products..."
              : `Showing ${displayedProducts.length} of ${products.length} products`}
          </p>
        </div>

        <Link
          to="/farmer/products"
          className="flex items-center gap-1 text-sm font-bold text-[#2D6A4F] hover:text-[#1B4332] transition hover:underline"
        >
          View all
          <i className="ri-arrow-right-line text-sm" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl bg-[var(--agri-card)] border border-[var(--agri-border)] shadow-2xs"
            >
              <div className="aspect-square bg-[var(--agri-hover)]" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-[var(--agri-hover)] rounded" />
                <div className="h-4 w-1/2 bg-[var(--agri-hover)] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--agri-border)] bg-[var(--agri-card)] p-10 text-center text-[var(--agri-text-muted)]">
          No products yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              hideFooter
              hideDiscount
            />
          ))}
        </div>
      )}
    </section>
  );
}
