import { Link } from "react-router-dom";

import ProductCard from "../../common/ProductCard"

export default function RelevantProductsSection({ products = [] }) {
  if (!products.length) return null;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1B4332] dark:text-[var(--agri-brand-light)]">
            Recommended for You
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Products you might be interested in
          </p>
        </div>

        <Link
          to="/marketplace?sort=relevant"
          className="shrink-0 text-xs sm:text-sm font-bold text-[#2D6A4F] hover:text-[#1B4332] dark:text-[var(--agri-brand-light)] transition-colors"
        >
          View all
          <i className="ri-arrow-right-line ml-1" />
        </Link>
      </div>

      {/* Products */}
      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
          gap-3
          sm:gap-4
        "
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
