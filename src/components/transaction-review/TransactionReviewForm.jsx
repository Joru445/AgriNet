import FarmerReviewForm from "./FarmerReviewForm";
import ProductReviewForm from "./ProductReviewForm";

export default function TransactionReviewForm({
  farmerRating,
  farmerComment,
  productRating,
  productComment,

  onFarmerRatingChange,
  onFarmerCommentChange,

  onProductRatingChange,
  onProductCommentChange,

  onSubmit,

  submitting = false,
  error = "",
}) {
  const canSubmit = farmerRating >= 1 && productRating >= 1 && !submitting;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        if (!canSubmit) {
          return;
        }

        onSubmit();
      }}
      className="space-y-4"
    >
      <FarmerReviewForm
        rating={farmerRating}
        comment={farmerComment}
        onRatingChange={onFarmerRatingChange}
        onCommentChange={onFarmerCommentChange}
        disabled={submitting}
      />

      <ProductReviewForm
        rating={productRating}
        comment={productComment}
        onRatingChange={onProductRatingChange}
        onCommentChange={onProductCommentChange}
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
