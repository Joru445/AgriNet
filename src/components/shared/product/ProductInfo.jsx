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
    <section className="px-4 pt-5 sm:px-6 lg:pt-6">
      {/* Product Name + Report */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--agri-text)] leading-tight">
          {product.name}
        </h1>
        {!isOwner && onReport && (
          <button
            type="button"
            onClick={onReport}
            className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-[var(--agri-text-muted)] hover:text-red-600 hover:bg-red-500/10 px-2 py-1 rounded-lg transition cursor-pointer"
            title={t("productDetails.reportThisProduct")}
          >
            <i className="ri-flag-line text-sm" />
          </button>
        )}
      </div>

      {/* Price + Discount */}
      <div className="mt-3 flex items-baseline gap-3 flex-wrap">
        <p className="text-3xl sm:text-4xl font-extrabold text-[#1B4332] dark:text-[var(--agri-brand-light)] tracking-tight">
          ₱{priceFormatted}
          <span className="text-sm sm:text-base font-semibold text-[var(--agri-text-muted)] ml-1">
            /{product.unit}
          </span>
        </p>
        {hasDiscount && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[var(--agri-text-muted)] line-through">
              ₱{originalPriceFormatted}
            </span>
            <span className="inline-flex items-center rounded bg-[#FF2D55] px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
              -{discountPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Badges: Category · Stock · Duration */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 px-2.5 py-1 text-xs font-bold text-[var(--agri-text)]">
          <i className={`${categoryIcon} text-[#2D6A4F] dark:text-[var(--agri-brand)] text-sm`} />
          <span>{product.category || t("productDetails.produce")}</span>
        </span>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold border ${
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
          {isAvailable ? t("product.inStock") : t("product.outOfStock")}
        </span>

        {remainingTime && isAvailable && (
          <span className="inline-flex items-center rounded-full bg-[var(--agri-hover)] border border-[var(--agri-border)] px-2 py-0.5 text-xs font-bold text-[var(--agri-text-secondary)]">
            <span>{remainingTime}</span>
          </span>
        )}
      </div>

      {/* Rating + Stock divider */}
      <div className="mt-4 pt-3 border-t border-[var(--agri-border-subtle)] flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md text-xs font-bold text-amber-700 dark:text-amber-300">
          <i className="ri-star-fill text-amber-500 text-sm" />
          <span>{averageRating.toFixed(1)}</span>
        </div>

        <span className="text-xs sm:text-sm font-semibold text-[var(--agri-text-secondary)]">
          {reviewCount}{" "}
          {reviewCount === 1
            ? t("reviews.reviewSingular")
            : t("reviews.reviewPlural")}
        </span>

        {product.stock != null && (
          <>
            <span className="text-[var(--agri-border)]">·</span>
            <span className="text-xs sm:text-sm font-semibold text-[var(--agri-text-secondary)]">
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
