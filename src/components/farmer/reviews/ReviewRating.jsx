export default function ReviewRating({ rating = 0 }) {
  const value = Math.min(5, Math.max(0, Number(rating) || 0));

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={
            star <= value
              ? "ri-star-fill text-yellow-400"
              : "ri-star-line text-gray-300"
          }
        />
      ))}

      <span className="ml-1 text-xs font-medium text-gray-500">
        {value.toFixed(1)}
      </span>
    </div>
  );
}
