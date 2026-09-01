import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getReviewsByProduct } from "../services/product-review.service";

import { getUserProfile } from "../services/user.service";
import { getInquiry } from "../services/inquiry.service";

export default function useProductReviews() {
  const { id: productId } = useParams();

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

        const uniqueReviewerIds = [
          ...new Set(
            productReviews
              .map((r) => r.reviewerId)
              .filter(Boolean),
          ),
        ];

        const reviewerProfiles = await Promise.all(
          uniqueReviewerIds.map(async (uid) => {
            try {
              const profile = await getUserProfile(uid);
              return [uid, profile];
            } catch {
              return [uid, null];
            }
          }),
        );

        const reviewerMap = new Map(
          reviewerProfiles.filter(([, p]) => p != null),
        );

        const neededInquiryIds = [
          ...new Set(
            productReviews
              .filter((r) => !r.proof?.url && r.inquiryId)
              .map((r) => r.inquiryId),
          ),
        ];

        const inquiryDocs = await Promise.all(
          neededInquiryIds.map(async (inqId) => {
            try {
              const inq = await getInquiry(inqId);
              return [inqId, inq];
            } catch {
              return [inqId, null];
            }
          }),
        );

        const inquiryMap = new Map(
          inquiryDocs.filter(([, i]) => i != null),
        );

        if (cancelled) {
          return;
        }

        const enrichedReviews = productReviews.map((review) => {
          const reviewer = reviewerMap.get(review.reviewerId);
          const inquiry = inquiryMap.get(review.inquiryId);

          return {
            ...review,
            reviewer: reviewer || {
              fullname: review.reviewerName || "Verified Buyer",
              profilePicture: review.reviewerAvatar || "",
            },
            inquiry: inquiry || (review.proof ? { proof: review.proof } : null),
          };
        });

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
