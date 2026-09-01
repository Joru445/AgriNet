import StatCard from "../../components/common/StatCard";
import RecentActivity from "../../components/admin/RecentActivity";
import RecentProducts from "../../components/admin/RecentProducts";
import RecentUsers from "../../components/admin/RecentUsers";
import ErrorState from "../../components/ui/ErrorState";

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

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Overview of what's happening on AgriNet.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 disabled:opacity-50 transition cursor-pointer"
          >
            <i className={`ri-refresh-line text-base ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <ErrorState
            title="Failed to load dashboard data"
            message="Something went wrong while loading the latest metrics."
            onRetry={refresh}
          />
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-28 rounded-2xl bg-white border border-gray-200 p-5 space-y-3 shadow-2xs animate-pulse"
              >
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-7 w-14 bg-gray-200 rounded" />
                <div className="h-3 w-28 bg-gray-100 rounded" />
              </div>
            ))
          ) : (
            <>
              <StatCard
                title="Total Users"
                value={stats?.users?.total ?? 0}
                description="Registered users"
                to="/admin/users"
              />

              <StatCard
                title="Farmers"
                value={stats?.users?.farmers ?? 0}
                description="Registered farmers"
                to="/admin/users"
              />

              <StatCard
                title="Consumers"
                value={stats?.users?.consumers ?? 0}
                description="Registered consumers"
                to="/admin/users"
              />

              <StatCard
                title="Products"
                value={stats?.products?.total ?? 0}
                description={`${stats?.products?.available ?? 0} available`}
                to="/admin/products"
              />

              <StatCard
                title="Ongoing"
                value={stats?.inquiries?.ongoing ?? 0}
                description="Ongoing inquiries"
                to="/admin/inquiries"
              />

              <StatCard
                title="Completed"
                value={stats?.inquiries?.completed ?? 0}
                description="Completed inquiries"
                to="/admin/inquiries"
              />
            </>
          )}
        </div>

        {/* Activity + Users */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {loading ? (
            <>
              <div className="h-80 rounded-2xl bg-white border border-gray-200 p-5 shadow-2xs animate-pulse space-y-4">
                <div className="h-6 w-36 bg-gray-200 rounded" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="h-80 rounded-2xl bg-white border border-gray-200 p-5 shadow-2xs animate-pulse space-y-4">
                <div className="h-6 w-36 bg-gray-200 rounded" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <RecentActivity
                users={recentUsers}
                products={recentProducts}
                inquiries={recentInquiries}
              />

              <RecentUsers users={recentUsers} />
            </>
          )}
        </div>

        {/* Products */}
        <div className="mt-6">
          {loading ? (
            <div className="h-72 rounded-2xl bg-white border border-gray-200 p-5 shadow-2xs animate-pulse space-y-4">
              <div className="h-6 w-36 bg-gray-200 rounded" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 bg-gray-100 rounded-xl" />
                ))}
              </div>
            </div>
          ) : (
            <RecentProducts products={recentProducts} />
          )}
        </div>
      </div>
    </div>
  );
}
