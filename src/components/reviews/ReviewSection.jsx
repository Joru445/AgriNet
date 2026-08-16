import ReviewCard from "./ReviewCard";
import ReviewEmpty from "./ReviewEmpty";

export default function ReviewSection({
  title = "Reviews",
  reviews = [],
  loading = false,
  type = "product",
}) {
  const isProduct = type === "product";

  if (loading) {
    return (
      <section className="rounded-2xl border border-gray-100 bg-white mt-6">
        <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="divide-y divide-gray-100">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-4 sm:p-5">
              <div className="flex gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>

          <p className="mt-0.5 text-xs text-gray-400">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <ReviewEmpty type={isProduct ? "product" : "farmer"} />
      ) : (
        <div className="divide-y divide-gray-100">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} type={type} />
          ))}
        </div>
      )}
    </section>
  );
}
