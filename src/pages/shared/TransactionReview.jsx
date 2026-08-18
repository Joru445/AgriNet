import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import useTransactionReview from "../../hooks/useTransactionReview";

import TransactionSummary from "../../components/transaction-review/TransactionSummary";
import TransactionReviewForm from "../../components/transaction-review/TransactionReviewForm";
import TransactionReviewView from "../../components/transaction-review/TransactionReviewView";

export default function TransactionReview() {
  const { inquiryId } = useParams();
  const { profile } = useAuth();

  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-500">Loading transaction...</div>
    );
  }

  if (!inquiry) {
    return (
      <div className="p-6 text-sm text-red-500">
        {error || "Transaction not found."}
      </div>
    );
  }

  const isConsumer = profile?.role === "consumer";

  const isOwner = inquiry.consumerId === profile?.uid;

  /*
   * A transaction is considered reviewed when
   * either review document exists.
   */
  const isReviewed = Boolean(farmerReview || productReview);

  const canSubmitReview =
    isConsumer && isOwner && inquiry.status === "completed" && !isReviewed;

  return (
    <div className="mx-auto w-full max-w-3xl p-4 pb-18 sm:p-6 sm:pb-4">
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="
            inline-flex items-center gap-1.5
            text-sm text-gray-500
            transition hover:text-[#2D6A4F]
          "
        >
          <i className="ri-arrow-left-line" />
          Back
        </button>

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
      </div>
    </div>
  );
}
