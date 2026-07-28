export default function RatingBar({ stars, count, percentage }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-sm font-medium">{stars} ★</span>

      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-yellow-400"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <span className="w-8 text-right text-sm text-gray-500">{count}</span>
    </div>
  );
}
