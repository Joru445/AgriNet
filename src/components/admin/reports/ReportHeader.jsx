import { useLanguage } from "../../../context/LanguageContext";

export default function ReportHeader() {
  const { t } = useLanguage();

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold text-(--agri-text) tracking-tight">
          {t("adminReport.headerTitle")}
        </h1>

        <p className="text-xs sm:text-sm text-(--agri-text-muted) font-medium">
          {t("adminReport.headerSubtitle")}
        </p>
      </div>
    </div>
  );
}
