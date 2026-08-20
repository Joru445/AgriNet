export default function DashboardHero({ profile, stats }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm opacity-90">Welcome back,</p>

      <h1 className="mt-1 text-3xl font-bold">{profile.fullname}</h1>

      <p className="mt-3 max-w-2xl text-green-900">
        You currently have{" "}
        <span className="font-semibold">{stats.totalProducts}</span>{" "}
        products listed,{" "}
        <span className="font-semibold">{stats.reviewCount}</span>{" "}
        customer reviews, and{" "}
        <span className="font-semibold">{stats.unreadMessages}</span>{" "}
        unread messages.
      </p>
    </div>
  );
}
