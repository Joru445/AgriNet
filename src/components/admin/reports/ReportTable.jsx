import { useLanguage } from "../../../context/LanguageContext";

import ReportTableRow from "./ReportTableRow";

export default function ReportTable({
  reports,
  pagination,
  page,
  onPageChange,
  onView,
}) {
  const { t } = useLanguage();

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-12 text-center shadow-md shadow-black/5">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-muted)]">
          <i className="ri-file-warning-line text-3xl" />
        </div>
        <p className="text-sm font-semibold text-[var(--agri-text)]">
          {t("adminReport.noReportsFound")}
        </p>
        <p className="mt-1 text-xs text-[var(--agri-text-muted)]">
          {t("adminReport.noReportsHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-md shadow-black/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50">
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminReport.report")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminReport.reportedBy")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminReport.type")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminReport.reportStatus")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminReport.dateTime")}
              </th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminReport.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <ReportTableRow key={report.id} report={report} onView={onView} />
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--agri-border-subtle)] px-5 py-3">
          <p className="text-xs text-[var(--agri-text-muted)]">
            {t("adminReport.showingCount", {
              count: reports.length,
              total: pagination.total,
            })}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] px-3 py-1.5 text-xs font-semibold text-[var(--agri-text-secondary)] transition hover:bg-[var(--agri-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("adminReport.previousPage")}
            </button>
            <span className="text-xs font-semibold text-[var(--agri-text-muted)]">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pagination.totalPages}
              className="rounded-lg border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] px-3 py-1.5 text-xs font-semibold text-[var(--agri-text-secondary)] transition hover:bg-[var(--agri-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("adminReport.nextPage")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
