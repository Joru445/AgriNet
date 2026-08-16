import { useEffect, useState } from "react";

import { getReviewsByProduct } from "../services/product-review.service";

import { getUserProfile } from "../services/user.service";
import { getInquiry } from "../services/inquiry.service";

export default function useProductReviews(productId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadReviews() {
      try {
        setLoading(true);
        setError(null);

        const productReviews = await getReviewsByProduct(productId);

        if (cancelled) {
          return;
        }

        const enrichedReviews = await Promise.all(
          productReviews.map(async (review) => {
            const [reviewer, inquiry] = await Promise.all([
              review.reviewerId ? getUserProfile(review.reviewerId) : null,

              review.inquiryId ? getInquiry(review.inquiryId) : null,
            ]);

            return {
              ...review,
              reviewer,
              inquiry,
            };
          }),
        );

        if (cancelled) {
          return;
        }

        setReviews(enrichedReviews);
      } catch (err) {
        console.error("Failed to load product reviews:", err);

        if (!cancelled) {
          setReviews([]);
          setError(err.message || "Failed to load product reviews.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return {
    reviews,
    loading,
    error,
  };
}
