import { useLanguage } from "../../../context/LanguageContext";

export default function DashboardHeader({ loading, onRefresh }) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--agri-border-subtle)] bg-[var(--agri-card)] px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <h1 className="text-(--agri-text)">Dashboard</h1>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] px-3 py-1.5 text-xs font-bold text-[var(--agri-text-secondary)] shadow-2xs hover:bg-[var(--agri-hover)] hover:text-[#2D6A4F] dark:hover:text-[var(--agri-brand)] disabled:opacity-50 transition cursor-pointer active:scale-95"
      >
        <i
          className={`ri-refresh-line text-sm ${loading ? "animate-spin" : ""}`}
        />
        <span className="hidden sm:inline">{t("admin.refresh")}</span>
      </button>
    </div>
  );
}
