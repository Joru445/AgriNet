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
    <main className="flex flex-col flex-1 py-2 px-2 gap-6 lg:h-full lg:min-h-0">
        <DashboardHero profile={profile} stats={stats} loading={loading} />

        <DashboardStats stats={stats} loading={loading} />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] lg:flex-1 lg:min-h-0 lg:overflow-y-auto scrollbar-none">
          <RecentProducts products={recentProducts} loading={loading} />

          <RecentReviews reviews={recentReviews} loading={loading} />
        </div>
    </main>
  );
}
