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
            let reviewer = null;
            let inquiry = null;

            try {
              if (review.reviewerId) {
                reviewer = await getUserProfile(review.reviewerId).catch(() => null);
              }
            } catch (e) {
              console.warn("Could not fetch reviewer:", e);
            }

            try {
              if (review.inquiryId) {
                inquiry = await getInquiry(review.inquiryId).catch(() => null);
              }
            } catch (e) {
              console.warn("Could not fetch inquiry:", e);
            }

            return {
              ...review,
              reviewer: reviewer || {
                fullname: review.reviewerName || "Verified Buyer",
                profilePicture: "",
              },
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
