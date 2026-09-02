import { useLanguage } from "../../../context/LanguageContext";

export default function ProductDescription({ product }) {
  const { t } = useLanguage();

  return (
    <section className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5 sm:p-6 shadow-sm">
      <h2 className="font-bold text-lg text-[var(--agri-text)] mb-2">{t("productDetails.description")}</h2>

      <p className="leading-relaxed text-sm sm:text-base text-[var(--agri-text-secondary)] whitespace-pre-wrap font-normal">
        {product.description || t("productDetails.noDescription")}
      </p>
    </section>
  );
}
