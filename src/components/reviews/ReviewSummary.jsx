import RatingStars from "./RatingStars";

export default function ReviewSummary({ averageRating, reviewCount }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-5xl font-bold text-[#1B4332]">
          {averageRating.toFixed(1)}
        </h2>

        <div className="mt-2">
          <RatingStars rating={Math.round(averageRating)} size="text-xl" />
        </div>

        <p className="mt-3 text-sm text-gray-500">
          Based on {reviewCount} reviews
        </p>
      </div>
    </div>
  );
}
