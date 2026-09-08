import { useState } from "react";

import DashboardHeader from "../../components/farmer/dashboard/DashboardHeader";
import KpiRow from "../../components/farmer/dashboard/KpiRow";
import InquiryTrendCard from "../../components/farmer/metrics/InquiryTrendCard";
import ProductBreakdownCard from "../../components/farmer/metrics/ProductBreakdownCard";
import InquiryPipeline from "../../components/farmer/dashboard/InquiryPipeline";
import RecentActivityTabbed from "../../components/farmer/dashboard/RecentActivityTabbed";
import ErrorState from "../../components/ui/ErrorState";

import useDashboard from "../../hooks/useDashboard";
import useFarmerAnalytics from "../../hooks/useFarmerAnalytics";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { DEFAULT_RANGE_PRESET } from "../../utils/analyticsDateRange";

export default function Dashboard() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [range, setRange] = useState(DEFAULT_RANGE_PRESET);

  const {
    stats,
    recentProducts,
    recentReviews,
    loading,
    error,
    reloadDashboard,
  } = useDashboard();

  const analytics = useFarmerAnalytics(range);

  const pendingCount = stats.pendingInquiries ?? 0;

  return (
    <main className="bg-[var(--agri-page)] overflow-x-hidden">
      {/* ── Tier 1: Header ────────────────────────────────────── */}
      <DashboardHeader
        profile={profile}
        loading={loading}
        onRefresh={reloadDashboard}
      />

      {error && (
        <ErrorState
          className="mx-4 mt-3"
          title={t("admin.failedToLoad")}
          message={t("admin.failedToLoadMessage")}
          onRetry={reloadDashboard}
        />
      )}

      {/* ── Tier 2: KPIs + Secondary Strip ───────────────────── */}
      <KpiRow stats={stats} loading={loading} />

      {/* ── Tier 3: Analytics ─────────────────────────────────── */}
      <div className="flex flex-col gap-2.5 p-4">
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-3">
          <InquiryTrendCard
            analytics={analytics.inquiryAnalytics}
            range={range}
            onRangeChange={setRange}
            className="lg:col-span-2"
          />
          <ProductBreakdownCard
            analytics={analytics.productAnalytics}
          />
        </div>

        {/* ── Tier 4: Inquiry Pipeline ────────────────────────── */}
        <InquiryPipeline stats={stats} loading={loading} />

        {/* ── Tier 5: Action Required ─────────────────────────── */}
        {!loading && pendingCount > 0 && (
          <a
            href="/farmer/transactions"
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

        {/* ── Tier 6: Recent Activity ─────────────────────────── */}
        <RecentActivityTabbed
          products={recentProducts}
          reviews={recentReviews}
          loading={loading}
        />
      </div>
    </main>
  );
}
