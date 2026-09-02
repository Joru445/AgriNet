import { Link } from "react-router-dom";

import { useLanguage } from "../../../context/LanguageContext";
import ProductCard from "../../common/ProductCard";

export default function ProductGrid({ products, hasActiveFilter }) {
  const { t } = useLanguage();
  if (!products.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      {/* Section Header */}
      {!hasActiveFilter && (
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-[#1B4332]">
                {t("consumer.allProducts")}
              </h2>
            </div>
          </div>

          <Link
            to="?sort=newest"
            className="shrink-0 text-xs sm:text-sm font-bold text-[#2D6A4F] transition-colors hover:text-[#1B4332]"
          >
            {t("consumer.viewAll")}
            <i className="ri-arrow-right-line ml-1" />
          </Link>
        </div>
      )}

      {/* Products */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
