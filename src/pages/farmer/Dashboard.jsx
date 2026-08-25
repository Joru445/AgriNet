import { useAuth } from "../../context/AuthContext";

import useDashboard from "../../hooks/useDashboard";

import DashboardHero from "../../components/farmer/dashboard/DashboardHero";
import DashboardStats from "../../components/farmer/dashboard/DashboardStats";
import RecentProducts from "../../components/farmer/dashboard/RecentProducts";
import RecentReviews from "../../components/farmer/dashboard/RecentReviews";

export default function Dashboard() {
  const { profile } = useAuth();

  const {
    loading,

    stats,

    recentProducts,
    recentReviews,
  } = useDashboard();

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-16 md:pb-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardHero profile={profile} stats={stats} loading={loading} />

        <DashboardStats stats={stats} loading={loading} />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <RecentProducts products={recentProducts} loading={loading} />

          <RecentReviews reviews={recentReviews} loading={loading} />
        </div>
      </div>
    </main>
  );
}
