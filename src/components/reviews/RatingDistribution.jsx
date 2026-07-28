import RatingBar from "./RatingBar";

export default function RatingDistribution({ distribution, getPercentage }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <h3 className="font-semibold text-lg">Rating Breakdown</h3>

      {[5, 4, 3, 2, 1].map((stars) => (
        <RatingBar
          key={stars}
          stars={stars}
          count={distribution[stars]}
          percentage={getPercentage(stars)}
        />
      ))}
    </div>
  );
}
