import { useState } from "react";

import FarmerReviewForm from "./FarmerReviewForm";
import ProductReviewForm from "./ProductReviewForm";

export default function TransactionReviewForm({
  onSubmit,
  submitting = false,
  error = "",
}) {
  const [farmerRating, setFarmerRating] = useState(0);
  const [farmerComment, setFarmerComment] = useState("");

  const [productRating, setProductRating] = useState(0);
  const [productComment, setProductComment] = useState("");

  const canSubmit = farmerRating >= 1 && productRating >= 1 && !submitting;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    await onSubmit({
      farmerRating,
      farmerComment,
      productRating,
      productComment,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FarmerReviewForm
        rating={farmerRating}
        comment={farmerComment}
        onRatingChange={setFarmerRating}
        onCommentChange={setFarmerComment}
        disabled={submitting}
      />

      <ProductReviewForm
        rating={productRating}
        comment={productComment}
        onRatingChange={setProductRating}
        onCommentChange={setProductComment}
        disabled={submitting}
      />

      {error && (
        <div
          role="alert"
          className="
            rounded-xl
            border border-red-100
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-600
          "
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="
          w-full
          rounded-xl
          bg-[#2D6A4F]
          px-4
          py-3
          text-sm
          font-semibold
          text-white
          transition
          hover:bg-[#24583F]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {submitting ? "Submitting review..." : "Submit review"}
      </button>
    </form>
  );
}
