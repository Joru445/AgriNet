import { Link } from "react-router-dom";

import ProductCard from "../../common/ProductCard";

const MAX_PRODUCTS = 4;

export default function RecentProductsSection({ products = [] }) {
  const recentProducts = [...products]
    .filter((product) => product?.createdAt)
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
    .slice(0, MAX_PRODUCTS);

  if (!recentProducts.length) return null;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">

            <h2 className="text-lg sm:text-xl font-black text-[#1B4332] dark:text-[var(--agri-brand-light)]">
              Recently Added
            </h2>
          </div>

          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            The latest products from local farmers
          </p>
        </div>

        <Link
          to="?sort=newest"
          className="shrink-0 text-xs sm:text-sm font-bold text-[#2D6A4F] transition-colors hover:text-[#1B4332] dark:text-[var(--agri-brand-light)]"
        >
          View all
          <i className="ri-arrow-right-line ml-1" />
        </Link>
      </div>

      {/* Products */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {recentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
