export default function DashboardHero({ profile, stats = {}, loading = false }) {
  const displayName = profile?.fullname || profile?.username || "Farmer";

  return (
    <div className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5 shadow-sm">
      <p className="text-sm text-[var(--agri-text-muted)]">Welcome back,</p>

      <h1 className="mt-1 text-3xl font-bold text-[var(--agri-text)]">{displayName}</h1>

      {loading ? (
        <div className="mt-3 h-5 w-80 max-w-full bg-[var(--agri-hover)] rounded-md animate-pulse" />
      ) : (
        <p className="mt-3 max-w-2xl text-green-900">
          You currently have{" "}
          <span className="font-semibold">{stats.totalProducts ?? 0}</span>{" "}
          products listed,{" "}
          <span className="font-semibold">{stats.reviewCount ?? 0}</span>{" "}
          customer reviews, and{" "}
          <span className="font-semibold">{stats.unreadMessages ?? 0}</span>{" "}
          unread messages.
        </p>
      )}
    </div>
  );
}
