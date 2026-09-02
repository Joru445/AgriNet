import { useLanguage } from "../../../context/LanguageContext";

export default function NearbyHeader() {
  const { t } = useLanguage();
  return (
    <div className="my-6 px-4">
      <h2 className="text-xl font-bold text-[#1B4332] dark:text-[var(--agri-brand-light)]">
        {t("nearby.title")}
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        {t("nearby.subtitle")}
      </p>
    </div>
  );
}
