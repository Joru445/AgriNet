export default function StatCard({
  title,
  value,
  icon,
  color = "bg-green-100 text-[#2D6A4F]",
  subtitle,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <h2 className="mt-2 text-3xl font-bold text-[#1B4332]">{value}</h2>

          {subtitle && <p className="mt-2 text-xs text-gray-400">{subtitle}</p>}
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
        >
          <i className={`${icon} text-xl`} />
        </div>
      </div>
    </div>
  );
}
