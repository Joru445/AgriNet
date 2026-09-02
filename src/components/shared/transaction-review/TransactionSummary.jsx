import productPlaceholder from "../../../assets/img/productPlaceholder.png";
import Avatar from "../../common/Avatar";
import { useLanguage } from "../../../context/LanguageContext";

export default function TransactionSummary({ inquiry }) {
  const { t } = useLanguage();

  if (!inquiry) {
    return null;
  }

  const product = inquiry.productSnapshot ?? {};

  const farmer = inquiry.farmerSnapshot ?? {};

  const productImage = getImageUrl(product.imageUrl) || productPlaceholder;

  return (
    <section className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5 sm:p-6 shadow-md">
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)] border border-emerald-500/20">
          <i className="ri-checkbox-circle-fill text-xs" />
          {t("transactionReview.completedTransaction")}
        </span>

        <h2 className="mt-2 text-lg font-bold text-[var(--agri-text)]">
          {t("transactionReview.reviewTitle")}
        </h2>

        <p className="mt-0.5 text-sm text-[var(--agri-text-secondary)] font-medium">
          {t("transactionReview.reviewSubtitle")}
        </p>
      </div>

      <div className="flex gap-4 items-center bg-[var(--agri-hover)]/80 rounded-xl p-3.5 border border-[var(--agri-border-subtle)] shadow-2xs">
        <img
          src={productImage}
          alt={product.name || t("transactionReview.product")}
          className="
            h-20
            w-20
            shrink-0
            rounded-xl
            object-cover
            border border-[var(--agri-border-subtle)]
          "
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-[var(--agri-text)] text-base">
            {product.name || t("transactionReview.product")}
          </h3>

          {product.price != null && (
            <p className="mt-0.5 text-sm font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)]">
              ₱{product.price}
              {product.unit ? ` / ${product.unit}` : ""}
            </p>
          )}

          {inquiry.quantity != null && (
            <p className="mt-1 text-xs font-semibold text-[var(--agri-text-secondary)]">
              {t("transactionReview.quantityLabel")}{" "}
              <span className="font-bold text-[var(--agri-text)]">
                {inquiry.quantity} {product.unit || t("transactionReview.units")}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-[var(--agri-border-subtle)] pt-4">
        <Avatar src={farmer.profilePicture} name={farmer.fullname} />

        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--agri-text-muted)]">{t("transactionReview.farmer")}</p>

          <div className="flex items-center gap-1.5 min-w-0">
            <p className="truncate text-sm font-bold text-[var(--agri-text)]">
              {farmer.fullname || farmer.username || t("transactionReview.farmer")}
            </p>
            {farmer.verified && (
              <span
                title={t("transactionReview.verifiedFarmer")}
                aria-label={t("transactionReview.verifiedFarmer")}
                className="inline-flex shrink-0 items-center text-[#2D6A4F] dark:text-[var(--agri-brand)] text-xs"
              >
                <i className="ri-verified-badge-fill" />
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function getImageUrl(image) {
  if (typeof image === "string") {
    return image;
  }

  return image?.url || "";
}
