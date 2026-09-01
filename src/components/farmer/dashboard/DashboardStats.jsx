import StatCard from "../../common/StatCard";

export default function DashboardStats({ stats = {}, loading = false }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-pulse">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 rounded-2xl bg-[var(--agri-card)] border border-[var(--agri-border)] p-5 space-y-3 shadow-2xs"
          >
            <div className="h-4 w-24 bg-[var(--agri-hover)] rounded" />
            <div className="h-7 w-16 bg-[var(--agri-hover)] rounded" />
            <div className="h-3 w-32 bg-[var(--agri-hover)] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Products"
        value={stats.totalProducts ?? 0}
        description="Total of products you have."
        to="/farmer/products"
      />

      <StatCard
        title="Reviews"
        value={stats.reviewCount ?? 0}
        description="Your profile's review count."
        to="/farmer/reviews"
      />

      <StatCard
        title="Average Rating"
        value={(stats.averageRating ?? 0).toFixed(1)}
        description="Your average rating."
        to="/farmer/reviews"
      />

      <StatCard
        title="Unread Messages"
        value={stats.unreadMessages ?? 0}
        description="Messages you haven't read"
        to="/farmer/messages"
      />
    </div>
  );
}
