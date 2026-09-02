import { Link } from "react-router-dom";

import { useLanguage } from "../../../context/LanguageContext";
import ProductCard from "../../common/ProductCard";

const MAX_DISTANCE_KM = 5;
const MAX_PRODUCTS = 4;

export default function NearYouSection({ products = [], userLocation }) {
  const { t } = useLanguage();
  if (!userLocation) return null;

  const nearbyProducts = products
    .filter((product) => {
      const distance = Number(product.distance);
      const stock = Number(product.stock ?? 0);

      return (
        Number.isFinite(distance) &&
        distance <= MAX_DISTANCE_KM &&
        product.available !== false &&
        stock > 0
      );
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_PRODUCTS);

  if (!nearbyProducts.length) return null;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4">
        <div>

            <h2 className="text-lg sm:text-xl font-black text-[#1B4332] dark:text-[var(--agri-brand-light)]">
              {t("consumer.nearYou")}
            </h2>

          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            {t("consumer.nearYouSubtitle", { km: MAX_DISTANCE_KM })}
          </p>
        </div>

        <Link
          to="/marketplace?distance=5"
          className="shrink-0 text-xs sm:text-sm font-bold text-[#2D6A4F] transition-colors hover:text-[#1B4332] dark:text-[var(--agri-brand-light)]"
        >
          {t("consumer.viewAll")}
          <i className="ri-arrow-right-line ml-1" />
        </Link>
      </div>

      {/* Products */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {nearbyProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
