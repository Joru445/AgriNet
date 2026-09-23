import { useLanguage } from "../../../context/LanguageContext";

export default function UserManagementHeader() {
  const { t } = useLanguage();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[#52B788] shadow-2xs">
          <i className="ri-team-line text-xl" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-(--agri-text) tracking-tight">
            {t("adminUser.headerTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-(--agri-text-muted) font-medium">
            {t("adminUser.headerSubtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}
