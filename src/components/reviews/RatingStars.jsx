export default function RatingStars({ rating, size = "text-base" }) {
  return (
    <div className={`flex items-center gap-0.5 ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={
            star <= rating
              ? "ri-star-fill text-yellow-400"
              : "ri-star-line text-gray-300"
          }
        />
      ))}
    </div>
  );
}
