import { useLanguage } from "../../../context/LanguageContext";

export default function ReportHeader() {
  const { t } = useLanguage();

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">{t("adminReport.headerTitle")}</h1>

        <p className="text-sm text-gray-500">
          {t("adminReport.headerSubtitle")}
        </p>
      </div>
    </div>
  );
}
