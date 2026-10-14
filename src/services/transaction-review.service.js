import { apiRequest } from "./api/api.client";

export async function submitTransactionReview({
  inquiryId,
  reviewerId,
  farmerRating,
  farmerComment,
  productRating,
  productComment,
}) {
  // Kept as a compatibility export. Never reintroduce a direct batch: the
  // backend transaction validates ownership, completion and duplicates.
  return apiSubmitTransactionReview({
    inquiryId, reviewerId, farmerRating, farmerComment, productRating, productComment,
  });
}

/**
 * Submit a transaction review through the Express backend.
 *
 * The server derives the reviewer identity from the verified ID token,
 * validates the inquiry server-side, and persists aggregated ratings.
 */
export async function apiSubmitTransactionReview(data) {
  const result = await apiRequest("/v1/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return result.data;
}
