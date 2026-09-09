import { useLanguage } from "../../../context/LanguageContext";
import AdminPagination from "../../ui/AdminPagination";

import ActivityTableRow from "./ActivityTableRow";

export default function ActivityTable({
  logs,
  pagination,
  page,
  onPageChange,
}) {
  const { t } = useLanguage();

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-12 text-center shadow-md shadow-black/5">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-muted)]">
          <i className="ri-history-line text-3xl" />
        </div>
        <p className="text-sm font-semibold text-[var(--agri-text)]">
          {t("adminActivity.noLogsFound")}
        </p>
        <p className="mt-1 text-xs text-[var(--agri-text-muted)]">
          {t("adminActivity.noLogsHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-md shadow-black/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50">
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminActivity.action")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminActivity.target")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminActivity.admin")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminActivity.dateTime")}
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <ActivityTableRow key={log.id} log={log} />
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        count={logs.length}
        onPageChange={onPageChange}
        i18nPrefix="adminActivity"
      />
    </div>
  );
}
