import RatingStars from "./RatingStars";

export default function TransactionReviewView({
  farmerReview,
  productReview,
  productProof,
}) {
  return (
    <div className="space-y-5">
      {/* Review Summary Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2D6A4F]/10 border border-[#2D6A4F]/20">
            <i className="ri-star-smile-fill text-xl text-[#2D6A4F]" />
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-900">
              Transaction Review Ratings
            </h2>

            <p className="mt-0.5 text-xs font-semibold text-gray-600">
              Feedback and ratings for this completed transaction
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <RatingSummary
            label="Farmer Rating"
            icon="ri-user-star-line"
            review={farmerReview}
          />

          <RatingSummary
            label="Product Rating"
            icon="ri-shopping-bag-3-line"
            review={productReview}
          />
        </div>
      </div>

      {/* Farmer Review Card */}
      <ReviewCard
        title="Farmer Review"
        icon="ri-user-star-line"
        subtitle="Feedback about the farmer"
        review={farmerReview}
        emptyMessage="No farmer review was submitted."
      />

      {/* Product Review Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2D6A4F]/10 border border-[#2D6A4F]/20">
            <i className="ri-shopping-bag-3-line text-lg text-[#2D6A4F]" />
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-900">
              Product Review
            </h2>

            <p className="text-xs font-semibold text-gray-600">
              Experience with the purchased product
            </p>
          </div>
        </div>

        {productReview ? (
          <div className="mt-4">
            {/* Rating Box */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 shadow-2xs">
              <div className="flex flex-wrap items-center gap-3">
                <RatingStars value={productReview.rating} size="text-lg" />

                <span className="text-base font-bold text-gray-900">
                  {productReview.rating}.0
                </span>

                <span className="text-xs font-semibold text-gray-500">out of 5 stars</span>
              </div>

              {productReview.comment ? (
                <div className="mt-3.5 border-l-4 border-[#2D6A4F] bg-white p-3.5 rounded-r-xl border-t border-r border-b border-gray-200/70 shadow-2xs">
                  <p className="text-sm font-medium leading-relaxed text-gray-800 italic">
                    "{productReview.comment}"
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs font-medium text-gray-500 italic">
                  No written comment was provided.
                </p>
              )}
            </div>
          </div>
        ) : (
          <EmptyReview message="No product review was submitted." />
        )}

        {/* Transaction Proof */}
        {productProof && (
          <div className="mt-6 border-t border-gray-200 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Transaction Proof
                </p>

                <p className="text-xs font-medium text-gray-500">
                  Photo submitted by consumer as proof of receipt
                </p>
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                <i className="ri-checkbox-circle-fill text-green-600" />
                Verified
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-2xs">
              <img
                src={productProof}
                alt="Transaction proof"
                className="max-h-[28rem] w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RatingSummary({ label, icon, review }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/90 p-4 shadow-2xs">
      <div className="flex items-center gap-2">
        <i className={`${icon} text-[#2D6A4F] text-base`} />

        <span className="text-xs font-bold text-gray-700">{label}</span>
      </div>

      {review ? (
        <div className="mt-3 flex items-center gap-2.5">
          <RatingStars value={review.rating} size="text-base" />

          <span className="text-sm font-bold text-gray-900">
            {review.rating}.0 / 5
          </span>
        </div>
      ) : (
        <p className="mt-3 text-xs font-semibold text-gray-400">Not reviewed</p>
      )}
    </div>
  );
}

function ReviewCard({ title, icon, subtitle, review, emptyMessage }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2D6A4F]/10 border border-[#2D6A4F]/20">
          <i className={`${icon} text-lg text-[#2D6A4F]`} />
        </div>

        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>

          <p className="text-xs font-semibold text-gray-600">{subtitle}</p>
        </div>
      </div>

      {review ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/80 p-4 shadow-2xs">
          <div className="flex flex-wrap items-center gap-3">
            <RatingStars value={review.rating} size="text-lg" />

            <span className="text-base font-bold text-gray-900">
              {review.rating}.0
            </span>

            <span className="text-xs font-semibold text-gray-500">out of 5 stars</span>
          </div>

          {review.comment ? (
            <div className="mt-3.5 border-l-4 border-[#2D6A4F] bg-white p-3.5 rounded-r-xl border-t border-r border-b border-gray-200/70 shadow-2xs">
              <p className="text-sm font-medium leading-relaxed text-gray-800 italic">
                "{review.comment}"
              </p>
            </div>
          ) : (
            <p className="mt-3 text-xs font-medium text-gray-500 italic">
              No written comment was provided.
            </p>
          )}
        </div>
      ) : (
        <EmptyReview message={emptyMessage} />
      )}
    </div>
  );
}

function EmptyReview({ message }) {
  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-6 text-center">
      <i className="ri-star-line text-2xl text-gray-300" />

      <p className="mt-1.5 text-xs font-semibold text-gray-500">{message}</p>
    </div>
  );
}
