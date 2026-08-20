export default function StarRating({
  rating = 0,
  size = "text-base",
  showValue = true,
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = index < Math.round(rating);

          return (
            <i
              key={index}
              className={`${
                filled
                  ? "ri-star-fill text-amber-400"
                  : "ri-star-line text-gray-300"
              } ${size}`}
            />
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm text-gray-500">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
