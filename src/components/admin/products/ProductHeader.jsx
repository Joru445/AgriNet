import { useLanguage } from "../../../context/LanguageContext";

export default function ProductHeader() {
  const { t } = useLanguage();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[var(--agri-brand)]">
          <i className="ri-store-2-line text-xl" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--agri-text)]">
            {t("adminProduct.headerTitle")}
          </h1>
          <p className="text-sm text-[var(--agri-text-muted)]">
            {t("adminProduct.headerSubtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}
