import { apiRequest } from "./api/api.client";

export async function getReviewsByProduct(productId, { maxReviews = 20 } = {}) {
  try {
    const result = await apiRequest(
      `/reviews/products/${productId}?limit=${maxReviews}`,
    );
    return result.data || [];
  } catch {
    return [];
  }
}

export async function getProductReviewSummaries(productIds) {
  if (!productIds.length) return new Map();

  const result = await apiRequest(
    `/reviews/products/summaries?ids=${productIds.join(",")}`,
  );

  const data = result.data || {};

  return new Map(
    Object.entries(data).map(([productId, summary]) => [productId, summary]),
  );
}

export async function getInquiryProductReview(inquiryId) {
  try {
    const result = await apiRequest(`/reviews/inquiries/${inquiryId}/product`);
    return result.data ?? null;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}
