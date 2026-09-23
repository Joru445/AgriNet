import { useLanguage } from "../../../context/LanguageContext";

export default function ActivityHeader() {
  const { t } = useLanguage();

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold text-(--agri-text) tracking-tight">
          {t("adminActivity.headerTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-(--agri-text-muted) font-medium">
          {t("adminActivity.headerSubtitle")}
        </p>
      </div>
    </div>
  );
}
