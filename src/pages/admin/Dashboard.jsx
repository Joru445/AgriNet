import StatCard from "../../components/common/StatCard";
import RecentActivity from "../../components/admin/RecentActivity";
import RecentProducts from "../../components/admin/RecentProducts";
import RecentUsers from "../../components/admin/RecentUsers";

import useAdminDashboard from "../../hooks/useAdminDashboard";

export default function Dashboard() {
  const {
    stats,
    recentUsers,
    recentProducts,
    recentInquiries,
    loading,
    error,
    refresh,
  } = useAdminDashboard();

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 w-40 rounded bg-gray-200" />

            <div className="mt-2 h-4 w-64 rounded bg-gray-200" />

            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-32 rounded-2xl bg-gray-200" />
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="h-80 rounded-2xl bg-gray-200" />
              <div className="h-80 rounded-2xl bg-gray-200" />
            </div>

            <div className="mt-6 h-72 rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <i className="ri-error-warning-line text-xl text-red-500" />

              <div>
                <h2 className="font-semibold text-red-800">
                  Failed to load dashboard
                </h2>

                <p className="mt-1 text-sm text-red-600">
                  Something went wrong while loading the dashboard data.
                </p>

                <button
                  type="button"
                  onClick={refresh}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Overview of what's happening on AgriNet.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Total Users"
            value={stats.users.total}
            description="Registered users"
            to="/admin/users"
          />

          <StatCard
            title="Farmers"
            value={stats.users.farmers}
            description="Registered farmers"
            to="/admin/users"
          />

          <StatCard
            title="Consumers"
            value={stats.users.consumers}
            description="Registered consumers"
            to="/admin/users"
          />

          <StatCard
            title="Products"
            value={stats.products.total}
            description={`${stats.products.available} available`}
            to="/admin/products"
          />

          <StatCard
            title="Ongoing"
            value={stats.inquiries.ongoing}
            description="Ongoing inquiries"
            to="/admin/inquiries"
          />

          <StatCard
            title="Completed"
            value={stats.inquiries.completed}
            description="Completed inquiries"
            to="/admin/inquiries"
          />
        </div>

        {/* Activity + Users */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentActivity
            users={recentUsers}
            products={recentProducts}
            inquiries={recentInquiries}
          />

          <RecentUsers users={recentUsers} />
        </div>

        {/* Products */}
        <div className="mt-6">
          <RecentProducts products={recentProducts} />
        </div>
      </div>
    </div>
  );
}
