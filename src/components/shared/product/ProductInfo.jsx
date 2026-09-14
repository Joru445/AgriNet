import {
  getFormatPrice,
  getDiscount,
  hasProductDiscount,
} from "../../../utils/price";
import { useLiveRemainingTime } from "../../../utils/productExpiration";
import { getProductStatus, PRODUCT_STATUS } from "../../../utils/productStatus";
import { useLanguage } from "../../../context/LanguageContext";
import { showToast } from "../../../utils/toast";

const CATEGORY_ICONS = {
  vegetables: "ri-plant-line",
  fruits: "ri-seedling-line",
  grains: "ri-leaf-line",
  livestocks: "ri-heart-line",
  herbs: "ri-medicine-bottle-line",
  "root-crops": "ri-earth-line",
  poultry: "ri-egg-line",
  meats: "ri-restaurant-line",
  seafoods: "ri-water-flash-line",
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
  const productStatus = isExpired
    ? PRODUCT_STATUS.NO_STOCK
    : getProductStatus(product);
  const isNotAvailable = productStatus === PRODUCT_STATUS.NOT_AVAILABLE;
  const isNoStock = productStatus === PRODUCT_STATUS.NO_STOCK;
  const isInStock = productStatus === PRODUCT_STATUS.IN_STOCK;
  const isPreorder = product.sellingMode === "preorder";
  const priceFormatted = getFormatPrice(priceNum);
  const originalPriceFormatted = getFormatPrice(originalPriceNum);
  const categoryIcon =
    CATEGORY_ICONS[product.category] || "ri-shopping-basket-2-line";

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast.success(t("common.linkCopied"));
      }
    } catch {
      // User cancelled share or clipboard failed — ignore
    }
  }

  return (
    <section className="px-4 pt-5 sm:px-6 lg:pt-6">
      {/* Product Name + Report */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-(--agri-text) leading-tight">
          {product.name}
        </h1>
        <div className="shrink-0 flex items-center gap-1">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1 text-xs font-semibold text-(--agri-text-muted) hover:text-(--agri-brand-dark) hover:bg-(--agri-brand-dark)/10 px-2 py-1 rounded-lg transition cursor-pointer"
            title={t("productDetails.share")}
          >
            <i className="ri-share-line text-sm" />
          </button>
          {!isOwner && onReport && (
            <button
              type="button"
              onClick={onReport}
              className="inline-flex items-center gap-1 text-xs font-semibold text-(--agri-text-muted) hover:text-red-600 hover:bg-red-500/10 px-2 py-1 rounded-lg transition cursor-pointer"
              title={t("productDetails.reportThisProduct")}
            >
              <i className="ri-flag-line text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Price + Discount */}
      <div className="mt-3 flex items-baseline gap-3 flex-wrap">
        <p className="text-3xl sm:text-4xl font-extrabold text-(--agri-green-dark) dark:text-(--agri-brand-light) tracking-tight">
          ₱{priceFormatted}
          <span className="text-sm sm:text-base font-semibold text-(--agri-text-muted) ml-1">
            /{product.unit}
          </span>
        </p>
        {hasDiscount && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-(--agri-text-muted) line-through">
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
        {isPreorder && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
            <i className="ri-calendar-schedule-line text-amber-500 text-sm" />
            <span>{t("product.preOrder")}</span>
          </span>
        )}

        <span className="inline-flex items-center gap-1.5 rounded-full bg-(--agri-green-mid)/10 border border-(--agri-green-mid)/20 px-2.5 py-1 text-xs font-bold text-(--agri-text)">
          <i className={`${categoryIcon} text-(--agri-green-mid) dark:text-(--agri-brand-light) text-sm`} />
          <span>{product.category || t("productDetails.produce")}</span>
        </span>

        {!isPreorder && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold border ${
              isInStock
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isInStock ? "bg-emerald-600" : "bg-red-600"
              }`}
            />
            {isNotAvailable
              ? t("product.notAvailable")
              : isNoStock
                ? t("product.outOfStock")
                : t("product.inStock")}
          </span>
        )}

        {remainingTime && isInStock && (
          <span className="inline-flex items-center rounded-full bg-(--agri-hover) border border-(--agri-border) px-2 py-0.5 text-xs font-bold text-(--agri-text-secondary)">
            <span>{remainingTime}</span>
          </span>
        )}
      </div>

      {/* Pre-order Details */}
      {isPreorder && (
        <div className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
          {product.expectedAvailableDate && (
            <div className="flex items-center gap-2 text-sm">
              <i className="ri-calendar-check-line text-amber-500" />
              <span className="text-(--agri-text-secondary)">
                {t("productDetails.expectedAvailable")}{" "}
                <span className="font-semibold text-(--agri-text)">
                  {new Date(product.expectedAvailableDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </span>
            </div>
          )}
          {product.preOrderDeadline && (
            <div className="flex items-center gap-2 text-sm">
              <i className="ri-timer-line text-amber-500" />
              <span className="text-(--agri-text-secondary)">
                {t("productDetails.orderUntil")}{" "}
                <span className="font-semibold text-(--agri-text)">
                  {new Date(product.preOrderDeadline).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </span>
            </div>
          )}
          {product.preOrderLimit != null && (
            <div className="flex items-center gap-2 text-sm">
              <i className="ri-stack-line text-amber-500" />
              <span className="text-(--agri-text-secondary)">
                {product.reservedQuantity ?? 0} / {product.preOrderLimit} {product.unit || t("productDetails.unit")}{" "}
                {t("productDetails.reserved")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Rating + Stock divider */}
      <div className="mt-4 pt-3 border-t border-(--agri-border-subtle) flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md text-xs font-bold text-amber-700 dark:text-amber-300">
          <i className="ri-star-fill text-amber-500 text-sm" />
          <span>{Number(averageRating || 0).toFixed(1)}</span>
        </div>

        <span className="text-xs sm:text-sm font-semibold text-(--agri-text-secondary)">
          {reviewCount}{" "}
          {reviewCount === 1
            ? t("reviews.reviewSingular")
            : t("reviews.reviewPlural")}
        </span>

        {product.stock != null && (
          <>
            <span className="text-(--agri-border)">·</span>
            <span className="text-xs sm:text-sm font-semibold text-(--agri-text-secondary)">
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
