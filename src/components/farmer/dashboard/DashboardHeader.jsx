import { useLanguage } from "../../../context/LanguageContext";
import Button from "../../ui/Button";

export default function DashboardHeader({ loading, onRefresh }) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between gap-3 border-b border-(--agri-border-subtle) bg-(--agri-card) px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <h1 className="text-(--agri-text)">Dashboard</h1>
      </div>

      <Button variant="ghost" size="sm" icon="ri-refresh-line" loading={loading} onClick={onRefresh}>
        <span className="hidden sm:inline">{t("admin.refresh")}</span>
      </Button>
    </div>
  );
}
