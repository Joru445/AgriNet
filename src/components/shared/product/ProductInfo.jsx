import {
  getFormatPrice,
  getDiscount,
  hasProductDiscount,
} from "../../../utils/price";
import { useLiveRemainingTime } from "../../../utils/productExpiration";
import { useLanguage } from "../../../context/LanguageContext";

const CATEGORY_ICONS = {
  Vegetables: "ri-plant-line",
  Fruits: "ri-seedling-line",
  Grains: "ri-leaf-line",
  Livestock: "ri-heart-line",
  Herbs: "ri-medicine-bottle-line",
  "Root Crops": "ri-earth-line",
  Seafood: "ri-water-flash-line",
  Others: "ri-shopping-basket-2-line",
};

export default function ProductInfo({
  product,
  reviewCount,
  averageRating,
  onReport,
  isOwner = false,
}) {
  const { t } = useLanguage();
  const originalPriceNum = Number(product.originalPrice);
  const priceNum = Number(product.price ?? 0);
  const hasDiscount = hasProductDiscount(product.originalPrice, product.price);
  const discountPercent = hasDiscount
    ? getDiscount(product.originalPrice, product.price)
    : 0;

  const { remainingTime, isExpired } = useLiveRemainingTime(product);
  const isAvailable = product.available !== false && !isExpired;
  const priceFormatted = getFormatPrice(priceNum);
  const originalPriceFormatted = getFormatPrice(originalPriceNum);
  const categoryIcon =
    CATEGORY_ICONS[product.category] || "ri-shopping-basket-2-line";

  return (
    <section className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5 sm:p-6 shadow-sm">
      {/* Product Name */}
      <div className="flex justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--agri-text)] leading-tight">
          {product.name}
        </h1>{" "}
        {!isOwner && onReport && (
          <button
            type="button"
            onClick={onReport}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--agri-text-muted)] hover:text-red-600 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition cursor-pointer"
            title={t("productDetails.reportThisProduct")}
          >
            <i className="ri-alert-line text-sm" />
            <span>{t("productDetails.report")}</span>
          </button>
        )}
      </div>

      {/* Price Block */}
      <div className="mt-4 flex items-center gap-3.5 flex-wrap">
        <p className="text-3xl sm:text-4xl font-extrabold text-[#1B4332] dark:text-[var(--agri-brand-light)] tracking-tight">
          ₱{priceFormatted}
          <span className="text-base sm:text-lg font-semibold text-[var(--agri-text-muted)] ml-1">
            /{product.unit}
          </span>
        </p>

        {hasDiscount && (
          <div className="flex items-start gap-1.5">
            {/* Slashed original price */}
            <span className="text-base sm:text-lg font-bold text-[var(--agri-text-muted)] line-through">
              ₱{originalPriceFormatted}
            </span>
            {/* Percent in right side top of slash */}
            <span className="inline-flex items-center rounded-md bg-[#FF2D55] px-1.5 py-0.5 text-[10px] sm:text-xs font-extrabold text-white shadow-2xs -mt-1">
              -{discountPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Top Badges Row: Category (Readable with Shadow) + Stock Status + Duration + Report Button */}
      <div className="flex items-center gap-2 flex-wrap mt-2">
        {/* Category Pill with Icon & Shadow */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 px-3 py-1 text-xs font-bold text-[var(--agri-text)] shadow-xs">
          <i className={`${categoryIcon} text-[#2D6A4F] dark:text-[var(--agri-brand)] text-sm`} />
          <span>{product.category || t("productDetails.produce")}</span>
        </span>

        {/* Stock Status */}
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs border ${
            isAvailable
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
              : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isAvailable ? "bg-emerald-600" : "bg-red-600"
            }`}
          />
          {isAvailable
            ? t("product.inStock")
            : t("product.outOfStock")}
        </span>

        {/* Duration Badge if set */}
        {remainingTime && isAvailable && (
          <span className="inline-flex items-center rounded-full bg-[var(--agri-hover)] border border-[var(--agri-border)] px-2.5 py-0.5 text-xs font-bold text-[var(--agri-text-secondary)] shadow-2xs">
            <span>{remainingTime}</span>
          </span>
        )}
      </div>

      {/* Rating & Reviews + Stock Info - Solid readable divider line */}
      <div className="mt-4 pt-3.5 border-t-2 border-[var(--agri-border-subtle)] flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md text-xs font-bold text-amber-700 dark:text-amber-300">
          <i className="ri-star-fill text-amber-500 text-sm" />
          <span>{averageRating.toFixed(1)}</span>
        </div>

        <span className="text-xs sm:text-sm font-semibold text-[var(--agri-text-secondary)]">
          ({reviewCount}{" "}
          {reviewCount === 1
            ? t("reviews.reviewSingular")
            : t("reviews.reviewPlural")})
        </span>

        {product.stock != null && (
          <>
            <span className="text-[var(--agri-border)] font-bold">•</span>
            <span className="text-xs sm:text-sm font-bold text-[var(--agri-text-secondary)]">
              {t("productDetails.stockAvailable", {
                count: product.stock,
                unit: product.unit || t("productDetails.unit"),
              })}
            </span>
          </>
        )}
      </div>
    </section>
  );
}
