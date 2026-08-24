import { Link } from "react-router-dom";
import ProductCard from "../../common/ProductCard";

// Show max 4 products (2 columns × 2 rows)
const MAX_DISPLAY = 4;

export default function RecentProducts({ products }) {
  const displayedProducts = products.slice(0, MAX_DISPLAY);
  const hasMore = products.length > MAX_DISPLAY;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Recent Products</h2>
          <p className="text-xs font-medium text-gray-500 mt-0.5">
            Showing {displayedProducts.length} of {products.length} products
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

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          No products yet.
        </div>
      ) : (
        <>
          {/* Mobile: 2 cols × 2 rows | Desktop: 4 cols × 1 row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} hideFooter />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
