import StatCard from "../common/StatCard";

export default function DashboardStats({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Products"
        value={stats.totalProducts}
        description="Total of products you have."
      />

      <StatCard
        title="Reviews"
        value={stats.reviewCount}
        description="Your profile's review count."
      />

      <StatCard
        title="Average Rating"
        value={stats.averageRating.toFixed(1)}
        description="Your average rating."
      />

      <StatCard
        title="Unread Messages"
        value={stats.unreadMessages}
        description="Messages you haven't read"
      />
    </div>
  );
}
