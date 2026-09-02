import { useLanguage } from "../../../context/LanguageContext";

export default function UserManagementHeader() {
  const { t } = useLanguage();

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("adminUser.headerTitle")}</h1>

      <p className="mt-1 text-sm text-gray-500">
        {t("adminUser.headerSubtitle")}
      </p>
    </div>
  );
}
