import productPlaceholder from "../../../assets/img/productPlaceholder.png";
import { useLanguage } from "../../../context/LanguageContext";

export default function TransactionProduct({ inquiry }) {
  const { t } = useLanguage();
  const product = inquiry?.productSnapshot ?? {};

  const imageUrl =
    product.imageUrl || product.images?.[0]?.url || productPlaceholder;

  const quantity = inquiry?.quantity ?? 1;
  const unit = product.unit || "units";

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-sm">
      <div className="flex flex-col sm:flex-row">
        <img
          src={imageUrl}
          alt={product.name || "Product"}
          className="h-48 w-full object-cover sm:h-auto sm:w-48"
        />

        <div className="flex-1 p-5">
          <p className="text-xs font-medium text-[#2D6A4F] dark:text-[var(--agri-brand)]">{t("transactionProduct.title")}</p>

          <h2 className="mt-1 text-lg font-bold text-[var(--agri-text)]">
            {product.name || "Product"}
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <Info label={t("transactionProduct.quantity")} value={`${quantity} ${unit}`} />

            <Info
              label={t("transactionProduct.pricePer", { unit: product.unit })}
              value={`₱${Number(product.price ?? 0).toLocaleString()}`}
            />
          </div>

          <div className="mt-4 border-t border-[var(--agri-border-subtle)] pt-4">
            <Info
              label={t("transactionProduct.estimatedTotal")}
              value={`₱${(
                Number(product.price ?? 0) * Number(quantity)
              ).toLocaleString()}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-[var(--agri-text-muted)]">{label}</p>

      <p className="mt-1 text-sm font-semibold text-[var(--agri-text)]">{value}</p>
    </div>
  );
}
