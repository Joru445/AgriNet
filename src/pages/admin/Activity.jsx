import useAdminActivity from "../../hooks/useAdminActivity";

import ActivityHeader from "../../components/admin/activity/ActivityHeader";
import ActivityFilters from "../../components/admin/activity/ActivityFilters";
import ActivityTable from "../../components/admin/activity/ActivityTable";
import { InlineError } from "../../components/ui/ErrorState";
import { useLanguage } from "../../context/LanguageContext";

export default function Activity() {
  const { t } = useLanguage();
  const {
    logs,
    pagination,
    loading,
    error,
    search,
    setSearch,
    action,
    setAction,
    targetType,
    setTargetType,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    page,
    setPage,
  } = useAdminActivity();

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <ActivityHeader />

        <ActivityFilters
          search={search}
          onSearchChange={setSearch}
          action={action}
          onActionChange={setAction}
          targetType={targetType}
          onTargetTypeChange={setTargetType}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
        />

        {error && <InlineError message={error} />}

        {loading ? (
          <div className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-12 text-center shadow-md shadow-black/5">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--agri-hover)]">
              <i className="ri-loader-4-line animate-spin text-2xl text-[var(--agri-text-muted)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--agri-text-secondary)]">
              {t("adminActivity.loading")}
            </p>
          </div>
        ) : (
          <ActivityTable
            logs={logs}
            pagination={pagination}
            page={page}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
