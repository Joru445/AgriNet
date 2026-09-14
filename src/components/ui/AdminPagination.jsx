import { useLanguage } from "../../context/LanguageContext";

export default function AdminPagination({
  page,
  totalPages,
  total,
  count,
  onPageChange,
  i18nPrefix,
}) {
  const { t } = useLanguage();

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-(--agri-border-subtle) px-5 py-3">
      <p className="text-xs text-(--agri-text-muted)">
        {t(`${i18nPrefix}.showingCount`, { count, total })}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-(--agri-border-subtle) bg-(--agri-card) px-3 py-1.5 text-xs font-semibold text-(--agri-text-secondary) transition hover:bg-(--agri-hover) disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t(`${i18nPrefix}.previousPage`)}
        </button>
        <span className="text-xs font-semibold text-(--agri-text-muted)">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-(--agri-border-subtle) bg-(--agri-card) px-3 py-1.5 text-xs font-semibold text-(--agri-text-secondary) transition hover:bg-(--agri-hover) disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t(`${i18nPrefix}.nextPage`)}
        </button>
      </div>
    </div>
  );
}
