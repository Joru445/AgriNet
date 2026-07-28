export default function DashboardHero({ profile, stats }) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-[#2D6A4F] to-[#40916C] p-8 text-white">
      <p className="text-sm opacity-90">Welcome back,</p>

      <h1 className="mt-1 text-3xl font-bold">{profile.fullname}</h1>

      <p className="mt-3 max-w-2xl text-green-100">
        You currently have{" "}
        <span className="font-semibold text-white">{stats.totalProducts}</span>{" "}
        products listed,{" "}
        <span className="font-semibold text-white">{stats.reviewCount}</span>{" "}
        customer reviews, and{" "}
        <span className="font-semibold text-white">{stats.unreadMessages}</span>{" "}
        unread messages.
      </p>
    </div>
  );
}
