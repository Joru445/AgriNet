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
      <div className="rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-(--agri-hover) text-(--agri-text-muted) shadow-2xs">
          <i className="ri-history-line text-3xl" />
        </div>
        <p className="text-base font-bold text-(--agri-text)">
          {t("adminActivity.noLogsFound")}
        </p>
        <p className="mt-1 text-xs sm:text-sm text-(--agri-text-muted)">
          {t("adminActivity.noLogsHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px]">
          <thead>
            <tr className="border-b border-(--agri-border-subtle) bg-(--agri-hover)/60">
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-(--agri-text-muted)">
                {t("adminActivity.action")}
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-(--agri-text-muted)">
                {t("adminActivity.target")}
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-(--agri-text-muted)">
                {t("adminActivity.admin")}
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-(--agri-text-muted)">
                {t("adminActivity.dateTime")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--agri-border-subtle)">
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
