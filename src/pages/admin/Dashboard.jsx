import { useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/common/StatCard";
import DashboardSection from "../../components/common/DashboardSection";
import RecentActivity from "../../components/admin/RecentActivity";
import RecentProducts from "../../components/admin/RecentProducts";
import RecentUsers from "../../components/admin/RecentUsers";
import ErrorState from "../../components/ui/ErrorState";
import TabButton from "../../components/ui/TabButton";
import SkeletonBox from "../../components/common/SkeletonBox";
import UserGrowthCard from "../../components/admin/metrics/UserGrowthCard";
import CategoryDonutCard from "../../components/admin/metrics/CategoryDonutCard";
import TransactionActivityCard from "../../components/admin/metrics/TransactionActivityCard";

import useAdminDashboard from "../../hooks/useAdminDashboard";
import useAdminAnalytics from "../../hooks/useAdminAnalytics";
import { useLanguage } from "../../context/LanguageContext";
import { DEFAULT_RANGE_PRESET } from "../../utils/analyticsDateRange";

function KpiSkeleton() {
  return (
    <div className="rounded-xl border border-(--agri-border-subtle) bg-(--agri-card) p-2.5 shadow-2xs">
      <SkeletonBox className="h-3 w-16" />
      <SkeletonBox className="mt-1 h-6 w-10" />
      <SkeletonBox className="mt-1 h-2.5 w-20" />
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
    <main className="bg-(--agri-page) overflow-x-hidden">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--agri-border-subtle)] bg-[var(--agri-card)] px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="min-w-0">
            <h1 className="text-base font-bold text-[var(--agri-text)]">
              {t("admin.dashboard")}
            </h1>
            <p className="text-[11px] text-[var(--agri-text-muted)] font-medium">
              {t("admin.dashboardSubtitle")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-(--agri-border) bg-(--agri-card) px-2.5 py-1 text-xs font-semibold text-[var(--agri-text-secondary)] shadow-2xs hover:bg-[var(--agri-hover)] disabled:opacity-50 transition cursor-pointer"
        >
          <i className={`ri-refresh-line text-sm ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{t("admin.refresh")}</span>
        </button>
      </div>

      {error && (
        <ErrorState
          className="mx-4 mt-3"
          title={t("admin.failedToLoad")}
          message={t("admin.failedToLoadMessage")}
          onRetry={refresh}
        />
      )}

      {/* ── Tier 1: Primary KPIs ──────────────────────────── */}
      <div className="border-b border-(--agri-border-subtle) bg-(--agri-card)/50 px-4 py-2.5">
        <div data-onboarding="admin-stats" className="grid grid-cols-3 gap-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => <KpiSkeleton key={index} />)
          ) : (
            <>
              <StatCard compact title={t("admin.totalUsers")} value={stats?.users?.total ?? 0} />
              <StatCard compact title={t("admin.farmers")} value={stats?.users?.farmers ?? 0} />
              <StatCard compact title={t("admin.consumers")} value={stats?.users?.consumers ?? 0} />
              <StatCard compact title={t("admin.products")} value={stats?.products?.total ?? 0} />
              <StatCard compact title={t("admin.ongoing")} value={stats?.inquiries?.ongoing ?? 0} />
              <StatCard compact title={t("admin.completed")} value={stats?.inquiries?.completed ?? 0} />
              <StatCard compact title={t("admin.pending")} value={stats?.inquiries?.pending ?? 0} />
              <StatCard compact title={t("admin.suspended")} value={stats?.users?.suspended ?? 0} />
              <StatCard compact title={t("admin.pendingVerifications")} value={stats?.pendingVerifications ?? 0} />
            </>
          )}
        </div>

        {/* Secondary metadata strip */}
        {!loading && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-(--agri-text-muted)">
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-purple-400" />
              {t("admin.admins")}: <b className="text-(--agri-text)">{stats?.users?.admins ?? 0}</b>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-red-400" />
              {t("admin.unavailable")}: <b className="text-(--agri-text)">{stats?.products?.unavailable ?? 0}</b>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-blue-400" />
              {t("admin.preorders")}: <b className="text-(--agri-text)">{stats?.products?.preorder ?? 0}</b>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-amber-400" />
              {t("admin.reservedInquiries")}: <b className="text-(--agri-text)">{stats?.inquiries?.reserved ?? 0}</b>
            </span>
            {(stats?.verifications?.approved ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-green-400" />
                {t("admin.verifiedFarmers")}: <b className="text-(--agri-text)">{stats?.verifications?.approved ?? 0}</b>
              </span>
            )}
            {(stats?.reports?.pending ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-orange-400" />
                {t("admin.pendingReports")}: <b className="text-(--agri-text)">{stats?.reports?.pending ?? 0}</b>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Tier 2: Analytics ──────────────────────────────── */}
      <div className="flex flex-col gap-2.5 p-4">
        {/* ── Quick Access shortcuts ─────────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-(--agri-text-muted)">
            {t("admin.quickAccess")}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
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

        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-3">
          <UserGrowthCard
            analytics={analytics.userGrowth}
            range={range}
            onRangeChange={setRange}
            className="lg:col-span-2"
          />
          <CategoryDonutCard
            analytics={analytics.categoryDistribution}
          />
        </div>

        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-3">
          <TransactionActivityCard
            analytics={analytics.transactionAnalytics}
            range={range}
            onRangeChange={setRange}
            className="lg:col-span-2"
          />

          {/* Inquiry Pipeline — compact status panel */}
          <DashboardSection
            title={t("admin.sectionInquiries")}
            icon="ri-file-list-3-line"
            compact
            fill
          >
            {loading ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3].map((i) => <SkeletonBox key={i} className="h-7" />)}
              </div>
            ) : (
              <div className="flex flex-col p-3">
                {/* Total */}
                <a
                  href="/admin/transactions"
                  className="mb-2 flex items-baseline gap-2 rounded-lg border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/40 px-3 py-2 transition hover:border-[#2D6A4F]/40 hover:bg-[var(--agri-hover)]"
                >
                  <span className="text-2xl font-black text-[var(--agri-text)]">
                    {stats?.inquiries?.total ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-[var(--agri-text-muted)]">
                    {t("admin.totalInquiries")}
                  </span>
                </a>

                {/* Status grid */}
                <div className="grid grid-cols-2 gap-1.5">
                  {inquiryStatuses.map(([key, labelKey]) => (
                    <a
                      key={key}
                      href="/admin/transactions"
                      className="flex items-center justify-between rounded-lg border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/30 px-2.5 py-1.5 text-xs transition hover:border-[#2D6A4F]/40 hover:bg-[var(--agri-hover)]"
                    >
                      <span className="font-medium text-[var(--agri-text-muted)]">
                        {t(labelKey)}
                      </span>
                      <span className="font-bold text-[var(--agri-text)]">
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
            className="flex items-center gap-3 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 transition hover:border-amber-300 dark:hover:border-amber-500/50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <i className="ri-alert-line text-base" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                {t("admin.actionRequired")}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {t("admin.pendingInquiriesDesc", { count: pendingCount })}
              </p>
            </div>
            <i className="ri-arrow-right-line shrink-0 text-sm text-amber-400" />
          </a>
        )}

        {!loading && (stats?.pendingVerifications ?? 0) > 0 && (
          <a
            href="/admin/farmer-verifications"
            className="flex items-center gap-3 rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-4 py-3 transition hover:border-blue-300 dark:hover:border-blue-500/50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <i className="ri-shield-star-line text-base" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-blue-800 dark:text-blue-200">
                {t("admin.pendingVerifications")}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {t("admin.pendingVerificationsDesc", { count: stats?.pendingVerifications ?? 0 })}
              </p>
            </div>
            <i className="ri-arrow-right-line shrink-0 text-sm text-blue-400" />
          </a>
        )}

        {!loading && (stats?.reports?.pending ?? 0) > 0 && (
          <a
            href="/admin/reports?status=pending"
            className="flex items-center gap-3 rounded-2xl border border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 px-4 py-3 transition hover:border-orange-300 dark:hover:border-orange-500/50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
              <i className="ri-alert-line text-base" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-orange-800 dark:text-orange-200">
                {t("admin.pendingReports")}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                {t("admin.pendingReportsDesc", { count: stats?.reports?.pending ?? 0 })}
              </p>
            </div>
            <i className="ri-arrow-right-line shrink-0 text-sm text-orange-400" />
          </a>
        )}

        {/* ── Tier 4: Recent Activity ──────────────────────── */}
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          <DashboardSection
            title={t("admin.recentActivity")}
            subtitle={t("admin.latestActivity")}
            icon="ri-time-line"
            compact
            fill
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
            headerAction={
              <div className="flex shrink-0 items-center rounded-lg bg-[var(--agri-hover)] p-0.5">
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
      className="flex items-center gap-3 rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] px-3.5 py-3 shadow-2xs transition hover:border-[#2D6A4F]/40 hover:bg-[var(--agri-hover)]"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles}`}>
        <i className={`${icon} text-base`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[var(--agri-text)]">{title}</p>
        <p className="truncate text-[11px] text-[var(--agri-text-muted)]">{subtitle}</p>
      </div>
      <i className="ri-arrow-right-line shrink-0 text-sm text-[var(--agri-text-muted)]" />
    </Link>
  );
}
