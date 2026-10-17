import { useLanguage } from "../../context/LanguageContext";

export default function SectionPullIndicator({ refreshing = false }) {
  const { t } = useLanguage();
  if (!refreshing) return null;
  return (
    <div
      role="status"
      aria-label={t("marketplace.refreshingProducts")}
      className="pointer-events-none flex h-6 items-center justify-center"
    >
      <i className="ri-loader-4-line animate-spin text-xl text-[#2D6A4F] dark:text-(--agri-brand)" aria-hidden="true" />
    </div>
  );
}
