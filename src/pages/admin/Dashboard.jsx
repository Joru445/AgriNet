import { useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/ui/StatCard";
import DashboardSection from "../../components/ui/DashboardSection";
import RecentActivity from "../../components/admin/RecentActivity";
import RecentProducts from "../../components/admin/RecentProducts";
import RecentUsers from "../../components/admin/RecentUsers";
import ErrorState from "../../components/ui/ErrorState";
import TabButton from "../../components/ui/TabButton";
import Button from "../../components/ui/Button";
import SkeletonBox from "../../components/ui/SkeletonBox";
import UserGrowthCard from "../../components/admin/metrics/UserGrowthCard";
import CategoryDonutCard from "../../components/admin/metrics/CategoryDonutCard";
import TransactionActivityCard from "../../components/admin/metrics/TransactionActivityCard";

import useAdminDashboard from "../../hooks/useAdminDashboard";
import useAdminAnalytics from "../../hooks/useAdminAnalytics";
import { useLanguage } from "../../context/LanguageContext";
import { DEFAULT_RANGE_PRESET } from "../../utils/analyticsDateRange";

function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) p-3 sm:p-4 shadow-sm">
      <SkeletonBox className="h-3.5 w-20" />
      <SkeletonBox className="mt-2 h-7 w-12" />
      <SkeletonBox className="mt-1.5 h-3 w-24" />
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [tabular, setTabular] = useState("users");
  const [range, setRange] = useState(DEFAULT_RANGE_PRESET);

  const {
    stats,
    recentUsers,
    recentProducts,
    recentInquiries,
    loading,
    error,
    refresh,
  } = useAdminDashboard();

  const analytics = useAdminAnalytics(range);

  const inquiryStatuses = [
    ["pending", "transactions.status.pending"],
    ["accepted", "transactions.status.accepted"],
    ["reserved", "transactions.status.reserved"],
    ["ongoing", "transactions.status.ongoing"],
    ["completed", "transactions.status.completed"],
    ["cancelled", "transactions.status.cancelled"],
  ];

  const pendingCount = stats?.inquiries?.pending ?? 0;

  return (
    <main className="bg-(--agri-page) overflow-x-hidden min-h-screen">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="border-b border-(--agri-border-subtle) bg-(--agri-card) shadow-2xs">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 px-4 sm:px-6 py-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-(--agri-text) tracking-tight">
              {t("admin.dashboard")}
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-(--agri-text-muted) font-medium">
              {t("admin.dashboardSubtitle")}
            </p>
          </div>

          <Button
            type="button"
            variant="cancel"
            size="sm"
            onClick={refresh}
            disabled={loading}
            loading={loading}
            icon={loading ? undefined : "ri-refresh-line"}
            className="rounded-xl shadow-xs"
          >
            <span className="hidden sm:inline">{t("admin.refresh")}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
          <ErrorState
            title={t("admin.failedToLoad")}
            message={t("admin.failedToLoadMessage")}
            onRetry={refresh}
          />
        </div>
      )}

      {/* ── Tier 1: Primary KPIs ──────────────────────────── */}
      <div className="border-b border-(--agri-border-subtle) bg-(--agri-card)/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-5">
          <div data-onboarding="admin-stats" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
            {loading ? (
              Array.from({ length: 9 }).map((_, index) => <KpiSkeleton key={index} />)
            ) : (
              <>
                <StatCard compact title={t("admin.totalUsers")} value={stats?.users?.total ?? 0} to="/admin/users" />
                <StatCard compact title={t("admin.farmers")} value={stats?.users?.farmers ?? 0} to="/admin/users" />
                <StatCard compact title={t("admin.consumers")} value={stats?.users?.consumers ?? 0} to="/admin/users" />
                <StatCard compact title={t("admin.products")} value={stats?.products?.total ?? 0} to="/admin/products" />
                <StatCard compact title={t("admin.ongoing")} value={stats?.inquiries?.ongoing ?? 0} to="/admin/transactions" />
                <StatCard compact title={t("admin.completed")} value={stats?.inquiries?.completed ?? 0} to="/admin/transactions" />
                <StatCard compact title={t("admin.pending")} value={stats?.inquiries?.pending ?? 0} to="/admin/transactions" />
                <StatCard compact title={t("admin.suspended")} value={stats?.users?.suspended ?? 0} to="/admin/users" />
                <StatCard compact title={t("admin.pendingVerifications")} value={stats?.pendingVerifications ?? 0} to="/admin/farmer-verifications" />
              </>
            )}
          </div>

          {/* Secondary metadata strip */}
          {!loading && (
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) px-4 py-3 text-xs shadow-xs">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-(--agri-text-secondary)">
                <span className="inline-flex items-center gap-1.5">
                  <i className="ri-shield-user-fill text-purple-500 text-sm" />
                  <span className="font-medium text-(--agri-text-muted)">{t("admin.admins")}:</span>
                  <span className="font-bold text-(--agri-text)">{stats?.users?.admins ?? 0}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="ri-forbid-2-line text-red-500 text-sm" />
                  <span className="font-medium text-(--agri-text-muted)">{t("admin.unavailable")}:</span>
                  <span className="font-bold text-(--agri-text)">{stats?.products?.unavailable ?? 0}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="ri-time-line text-blue-500 text-sm" />
                  <span className="font-medium text-(--agri-text-muted)">{t("admin.preorders")}:</span>
                  <span className="font-bold text-(--agri-text)">{stats?.products?.preorder ?? 0}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="ri-bookmark-line text-amber-500 text-sm" />
                  <span className="font-medium text-(--agri-text-muted)">{t("admin.reservedInquiries")}:</span>
                  <span className="font-bold text-(--agri-text)">{stats?.inquiries?.reserved ?? 0}</span>
                </span>
                {(stats?.verifications?.approved ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <i className="ri-checkbox-circle-fill text-emerald-500 text-sm" />
                    <span className="font-medium text-(--agri-text-muted)">{t("admin.verifiedFarmers")}:</span>
                    <span className="font-bold text-(--agri-text)">{stats?.verifications?.approved ?? 0}</span>
                  </span>
                )}
                {(stats?.reports?.pending ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <i className="ri-alarm-warning-fill text-orange-500 text-sm" />
                    <span className="font-medium text-(--agri-text-muted)">{t("admin.pendingReports")}:</span>
                    <span className="font-bold text-(--agri-text)">{stats?.reports?.pending ?? 0}</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Tier 2: Analytics ──────────────────────────────── */}
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-4 sm:gap-6 p-4 sm:px-6 py-5 sm:py-6 pb-12">
        {/* ── Quick Access shortcuts ─────────────────────────── */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-(--agri-text-muted)">
            {t("admin.quickAccess")}
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <ShortcutCard
              to="/admin/transactions"
              icon="ri-file-list-3-line"
              title={t("adminTransaction.headerTitle")}
              subtitle={t("adminTransaction.headerSubtitle")}
              styles="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            />
            <ShortcutCard
              to="/admin/products"
              icon="ri-store-2-line"
              title={t("adminProduct.headerTitle")}
              subtitle={t("adminProduct.headerSubtitle")}
              styles="bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400"
            />
            <ShortcutCard
              to="/admin/users"
              icon="ri-user-settings-line"
              title={t("adminUser.headerTitle")}
              subtitle={t("adminUser.headerSubtitle")}
              styles="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"
            />
            <ShortcutCard
              to="/admin/activity"
              icon="ri-history-line"
              title={t("adminActivity.headerTitle")}
              subtitle={t("adminActivity.headerSubtitle")}
              styles="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <UserGrowthCard
            analytics={analytics.userGrowth}
            range={range}
            onRangeChange={setRange}
            className="lg:col-span-2 shadow-sm"
          />
          <CategoryDonutCard
            analytics={analytics.categoryDistribution}
            className="shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <TransactionActivityCard
            analytics={analytics.transactionAnalytics}
            range={range}
            onRangeChange={setRange}
            className="lg:col-span-2 shadow-sm"
          />

          {/* Inquiry Pipeline — compact status panel */}
          <DashboardSection
            title={t("admin.sectionInquiries")}
            icon="ri-file-list-3-line"
            compact
            fill
            className="shadow-sm"
          >
            {loading ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3].map((i) => <SkeletonBox key={i} className="h-7" />)}
              </div>
            ) : (
              <div className="flex flex-col p-3.5">
                {/* Total */}
                <a
                  href="/admin/transactions"
                  className="mb-2.5 flex items-baseline gap-2 rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/40 px-3.5 py-2.5 shadow-2xs transition hover:border-[#2D6A4F]/40 hover:bg-(--agri-hover)"
                >
                  <span className="text-2xl font-black text-(--agri-text)">
                    {stats?.inquiries?.total ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-(--agri-text-muted)">
                    {t("admin.totalInquiries")}
                  </span>
                </a>

                {/* Status grid */}
                <div className="grid grid-cols-2 gap-2">
                  {inquiryStatuses.map(([key, labelKey]) => (
                    <a
                      key={key}
                      href="/admin/transactions"
                      className="flex items-center justify-between rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/30 px-3 py-2 text-xs shadow-2xs transition hover:border-[#2D6A4F]/40 hover:bg-(--agri-hover)"
                    >
                      <span className="font-medium text-(--agri-text-muted)">
                        {t(labelKey)}
                      </span>
                      <span className="font-bold text-(--agri-text)">
                        {stats?.inquiries?.[key] ?? 0}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </DashboardSection>
        </div>

        {/* ── Tier 3: Action Required ──────────────────────── */}
        {!loading && pendingCount > 0 && (
          <a
            href="/admin/transactions"
            className="flex items-center gap-3.5 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3.5 shadow-sm transition hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <i className="ri-alert-line text-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                {t("admin.actionRequired")}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {t("admin.pendingInquiriesDesc", { count: pendingCount })}
              </p>
            </div>
            <i className="ri-arrow-right-line shrink-0 text-base text-amber-500" />
          </a>
        )}

        {!loading && (stats?.pendingVerifications ?? 0) > 0 && (
          <a
            href="/admin/farmer-verifications"
            className="flex items-center gap-3.5 rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-4 py-3.5 shadow-sm transition hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <i className="ri-shield-star-line text-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-blue-800 dark:text-blue-200">
                {t("admin.pendingVerifications")}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {t("admin.pendingVerificationsDesc", { count: stats?.pendingVerifications ?? 0 })}
              </p>
            </div>
            <i className="ri-arrow-right-line shrink-0 text-base text-blue-500" />
          </a>
        )}

        {!loading && (stats?.reports?.pending ?? 0) > 0 && (
          <a
            href="/admin/reports?status=pending"
            className="flex items-center gap-3.5 rounded-2xl border border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 px-4 py-3.5 shadow-sm transition hover:border-orange-300 dark:hover:border-orange-500/50 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
              <i className="ri-alert-line text-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-orange-900 dark:text-orange-100">
                {t("admin.pendingReports")}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                {t("admin.pendingReportsDesc", { count: stats?.reports?.pending ?? 0 })}
              </p>
            </div>
            <i className="ri-arrow-right-line shrink-0 text-base text-orange-500" />
          </a>
        )}

        {/* ── Tier 4: Recent Activity ──────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <DashboardSection
            title={t("admin.recentActivity")}
            subtitle={t("admin.latestActivity")}
            icon="ri-time-line"
            compact
            fill
            className="shadow-sm"
          >
            {loading ? (
              <div className="space-y-1.5 p-3">
                {[1, 2, 3].map((i) => <SkeletonBox key={i} className="h-8" />)}
              </div>
            ) : (
              <RecentActivity
                users={recentUsers}
                products={recentProducts}
                inquiries={recentInquiries}
                showHeader={false}
              />
            )}
          </DashboardSection>

          <DashboardSection
            title={tabular === "users" ? t("admin.recentUsers") : t("admin.recentProducts")}
            icon={tabular === "users" ? "ri-user-add-line" : "ri-shopping-bag-3-line"}
            compact
            fill
            className="shadow-sm"
            headerAction={
              <div className="flex shrink-0 items-center rounded-lg bg-(--agri-hover) p-0.5">
                <TabButton
                  active={tabular === "users"}
                  onClick={() => setTabular("users")}
                  label={t("admin.recentUsers")}
                />
                <TabButton
                  active={tabular === "products"}
                  onClick={() => setTabular("products")}
                  label={t("admin.recentProducts")}
                />
              </div>
            }
          >
            {loading ? (
              <div className="space-y-1.5 p-3">
                {[1, 2, 3].map((i) => <SkeletonBox key={i} className="h-8" />)}
              </div>
            ) : tabular === "users" ? (
              <RecentUsers users={recentUsers} showHeader={false} />
            ) : (
              <RecentProducts products={recentProducts} showHeader={false} />
            )}
          </DashboardSection>
        </div>
      </div>
    </main>
  );
}

function ShortcutCard({ to, icon, title, subtitle, styles }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3.5 rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) p-3.5 sm:p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2D6A4F]/40 hover:bg-(--agri-hover) hover:shadow-md"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-2xs ${styles}`}>
        <i className={`${icon} text-lg`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-(--agri-text)">{title}</p>
        <p className="truncate text-xs text-(--agri-text-muted)">{subtitle}</p>
      </div>
      <i className="ri-arrow-right-line shrink-0 text-base text-(--agri-text-muted) transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#2D6A4F] dark:group-hover:text-(--agri-brand)" />
    </Link>
  );
}
