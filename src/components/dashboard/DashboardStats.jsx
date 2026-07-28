import StatCard from "./StatCard";

export default function DashboardStats({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Products"
        value={stats.totalProducts}
        icon="ri-store-2-line"
      />

      <StatCard
        title="Reviews"
        value={stats.reviewCount}
        icon="ri-star-line"
        color="bg-yellow-100 text-yellow-600"
      />

      <StatCard
        title="Average Rating"
        value={stats.averageRating.toFixed(1)}
        icon="ri-medal-line"
        color="bg-orange-100 text-orange-600"
      />

      <StatCard
        title="Unread Messages"
        value={stats.unreadMessages}
        icon="ri-message-3-line"
        color="bg-blue-100 text-blue-600"
      />
    </div>
  );
}
