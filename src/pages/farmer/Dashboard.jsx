import { useAuth } from "../../context/AuthContext";

import useDashboard from "../../hooks/useDashboard";

import DashboardHero from "../../components/dashboard/DashboardHero";
import DashboardStats from "../../components/dashboard/DashboardStats";
import RecentProducts from "../../components/dashboard/RecentProducts";
import RecentReviews from "../../components/dashboard/RecentReviews";
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton";

export default function Dashboard() {
  const { profile } = useAuth();

  const {
    loading,

    stats,

    recentProducts,
    recentReviews,
  } = useDashboard();

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-16 md:pb-8">
        <DashboardSkeleton />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-16 md:pb-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardHero profile={profile} stats={stats} />

        <DashboardStats stats={stats} />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <RecentProducts products={recentProducts} />

          <RecentReviews reviews={recentReviews} />
        </div>
      </div>
    </main>
  );
}
