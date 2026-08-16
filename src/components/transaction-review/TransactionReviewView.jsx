import RatingStars from "./RatingStars";

export default function TransactionReviewView({
  farmerReview,
  productReview,
  productProof,
}) {
  return (
    <div className="space-y-4">
      {/* Review Summary */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2D6A4F]/10">
            <i className="ri-star-smile-line text-xl text-[#2D6A4F]" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Transaction Review
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Feedback about this completed transaction
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <RatingSummary
            label="Farmer"
            icon="ri-user-star-line"
            review={farmerReview}
          />

          <RatingSummary
            label="Product"
            icon="ri-shopping-bag-3-line"
            review={productReview}
          />
        </div>
      </div>

      {/* Farmer Review */}
      <ReviewCard
        title="Farmer Review"
        icon="ri-user-star-line"
        review={farmerReview}
        emptyMessage="No farmer review was submitted."
      />

      {/* Product Review */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2D6A4F]/10">
            <i className="ri-shopping-bag-3-line text-[#2D6A4F]" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Product Review
            </h2>

            <p className="text-xs text-gray-400">
              Experience with the purchased product
            </p>
          </div>
        </div>

        {productReview ? (
          <div className="mt-5">
            {/* Rating */}
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <RatingStars value={productReview.rating} size="text-lg" />

                <span className="text-sm font-semibold text-gray-800">
                  {productReview.rating}.0
                </span>

                <span className="text-xs text-gray-400">out of 5</span>
              </div>

              {productReview.comment && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <p className="text-sm leading-relaxed text-gray-600">
                    "{productReview.comment}"
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <EmptyReview message="No product review was submitted." />
        )}

        {/* Transaction Proof */}
        {productProof && (
          <div className="my-5">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-700">
                  Transaction Proof
                </p>

                <p className="text-[11px] text-gray-400">
                  Submitted as proof of the completed transaction
                </p>
              </div>

              <i className="ri-checkbox-circle-line text-lg text-green-600" />
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
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
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center gap-2">
        <i className={`${icon} text-[#2D6A4F]`} />

        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>

      {review ? (
        <div className="mt-3 flex items-center gap-2">
          <RatingStars value={review.rating} size="text-base" />

          <span className="text-sm font-semibold text-gray-800">
            {review.rating}.0
          </span>
        </div>
      ) : (
        <p className="mt-3 text-xs text-gray-400">Not reviewed</p>
      )}
    </div>
  );
}

function ReviewCard({ title, icon, review, emptyMessage }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2D6A4F]/10">
          <i className={`${icon} text-[#2D6A4F]`} />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>

          <p className="text-xs text-gray-400">Feedback about the farmer</p>
        </div>
      </div>

      {review ? (
        <div className="mt-5 rounded-xl bg-gray-50 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <RatingStars value={review.rating} size="text-lg" />

            <span className="text-sm font-semibold text-gray-800">
              {review.rating}.0
            </span>

            <span className="text-xs text-gray-400">out of 5</span>
          </div>

          {review.comment ? (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="text-sm leading-relaxed text-gray-600">
                "{review.comment}"
              </p>
            </div>
          ) : (
            <p className="mt-4 text-xs text-gray-400">
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
    <div className="mt-4 rounded-xl bg-gray-50 px-4 py-6 text-center">
      <i className="ri-star-line text-2xl text-gray-300" />

      <p className="mt-2 text-xs text-gray-500">{message}</p>
    </div>
  );
}
