import { useLanguage } from "../../../context/LanguageContext";
import AdminPagination from "../../ui/AdminPagination";

import TransactionTableRow from "./TransactionTableRow";

export default function TransactionTable({
  inquiries,
  onView,
  pagination,
  onPageChange,
}) {
  const { t } = useLanguage();

  if (inquiries.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-12 text-center shadow-md shadow-black/5">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-muted)]">
          <i className="ri-file-list-3-line text-3xl" />
        </div>
        <p className="text-sm font-semibold text-[var(--agri-text)]">
          {t("adminTransaction.noTransactionsFound")}
        </p>
        <p className="mt-1 text-xs text-[var(--agri-text-muted)]">
          {t("adminTransaction.noTransactionsHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-md shadow-black/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50">
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminTransaction.product")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminTransaction.farmer")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminTransaction.consumer")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminTransaction.type")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminTransaction.status")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminTransaction.date")}
              </th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminTransaction.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <TransactionTableRow
                key={inquiry.id}
                inquiry={inquiry}
                onView={onView}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <AdminPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        count={inquiries.length}
        onPageChange={onPageChange}
        i18nPrefix="adminTransaction"
      />
    </div>
  );
}
