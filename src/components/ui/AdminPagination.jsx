import { useLanguage } from "../../context/LanguageContext";
import Button from "./Button";

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
        <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          {t(`${i18nPrefix}.previousPage`)}
        </Button>
        <span className="text-xs font-semibold text-(--agri-text-muted)">
          {page} / {totalPages}
        </span>
        <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          {t(`${i18nPrefix}.nextPage`)}
        </Button>
      </div>
    </div>
  );
}
