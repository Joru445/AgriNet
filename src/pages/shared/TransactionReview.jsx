import { useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import useTransactionReview from "../../hooks/useTransactionReview";

import TransactionSummary from "../../components/shared/transaction-review/TransactionSummary";
import TransactionReviewForm from "../../components/shared/transaction-review/TransactionReviewForm";
import TransactionReviewView from "../../components/shared/transaction-review/TransactionReviewView";

export default function TransactionReview() {
  const { inquiryId } = useParams();
  const { profile } = useAuth();

  const {
    inquiry,

    farmerReview,
    productReview,

    farmerRating,
    farmerComment,

    productRating,
    productComment,

    loading,
    submitting,
    error,

    setFarmerRating,
    setFarmerComment,

    setProductRating,
    setProductComment,

    submitReview,
  } = useTransactionReview(inquiryId);

  const isConsumer = profile?.role === "consumer";
  const isOwner = inquiry?.consumerId === profile?.uid;

  /*
   * A transaction is considered reviewed when
   * either review document exists.
   */
  const isReviewed = Boolean(farmerReview || productReview);

  const canSubmitReview =
    isConsumer && isOwner && inquiry?.status === "completed" && !isReviewed;

  if (!loading && !inquiry) {
    return (
      <div className="mx-auto w-full max-w-3xl p-4 pb-18 sm:p-6 sm:pb-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <i className="ri-error-warning-line text-4xl text-red-500 mb-2" />
          <h2 className="text-base font-bold text-red-800">Transaction Not Found</h2>
          <p className="text-sm text-red-600 mt-1">
            {error || "The requested transaction inquiry could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4 pb-18 sm:p-6 sm:pb-4">
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {/* Summary skeleton */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-2xs">
              <div className="flex justify-between items-center">
                <div className="h-6 w-32 bg-gray-200 rounded" />
                <div className="h-6 w-20 bg-gray-200 rounded-full" />
              </div>
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
              </div>
            </div>

            {/* Review form skeleton */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 shadow-2xs">
              <div className="h-5 w-36 bg-gray-200 rounded" />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-200" />
                ))}
              </div>
              <div className="h-24 w-full bg-gray-100 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            <TransactionSummary inquiry={inquiry} />

            {/* Existing review */}
            {isReviewed && (
              <TransactionReviewView
                farmerReview={farmerReview}
                productReview={productReview}
                productProof={inquiry.proof?.url}
              />
            )}

            {/* Consumer review form */}
            {canSubmitReview && (
              <TransactionReviewForm
                farmerRating={farmerRating}
                farmerComment={farmerComment}
                productRating={productRating}
                productComment={productComment}
                onFarmerRatingChange={setFarmerRating}
                onFarmerCommentChange={setFarmerComment}
                onProductRatingChange={setProductRating}
                onProductCommentChange={setProductComment}
                onSubmit={submitReview}
                submitting={submitting}
                error={error}
              />
            )}

            {/* Completed but user cannot review */}
            {!isReviewed && !canSubmitReview && inquiry.status === "completed" && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center">
                <i className="ri-star-line text-2xl text-gray-400" />

                <p className="mt-2 text-sm font-medium text-gray-700">
                  No review submitted yet.
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Only the consumer who completed this transaction can submit a
                  review.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
