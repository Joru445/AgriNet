export default function StarRating({
  rating = 0,
  size = "text-base",
  showValue = true,
  className = "",
}) {
  const numericRating = Number(rating) || 0;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5" aria-label={`Rating: ${numericRating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, index) => {
          const starValue = index + 1;
          const isFull = numericRating >= starValue;
          const isHalf = !isFull && numericRating >= index + 0.3 && numericRating < starValue;

          return (
            <i
              key={index}
              className={`${
                isFull
                  ? "ri-star-fill text-amber-400"
                  : isHalf
                    ? "ri-star-half-fill text-amber-400"
                    : "ri-star-line text-(--agri-border) dark:text-(--agri-border-subtle)"
              } ${size}`}
            />
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs sm:text-sm font-semibold text-(--agri-text-secondary) tabular-nums">
          {numericRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
