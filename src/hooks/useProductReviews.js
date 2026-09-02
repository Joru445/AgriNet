import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getReviewsByProduct } from "../services/product-review.service";
import { getUserProfile } from "../services/user.service";
import { getInquiry } from "../services/inquiry.service";
import { getCachedUserProfile } from "../utils/userProfileCache";

const MAX_CONCURRENCY = 4;

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => runWorker()),
  );

  return results;
}

function attachFallbacks(reviews) {
  return reviews.map((review) => ({
    ...review,
    reviewer: review.reviewer || {
      fullname: review.reviewerName || "Verified Buyer",
      profilePicture: review.reviewerAvatar || "",
    },
    inquiry: review.inquiry || (review.proof ? { proof: review.proof } : null),
  }));
}

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
      let baseReviews;

      try {
        setLoading(true);
        setError(null);

        baseReviews = await getReviewsByProduct(productId);

        if (cancelled) return;

        // Paint the review section right away from the single base query;
        // review cards already fall back to inline name/avatar/proof data.
        setReviews(attachFallbacks(baseReviews));
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setReviews([]);
          setError(err.message || "Failed to load product reviews.");
          setLoading(false);
        }
        return;
      }

      // Enrich reviewer profiles and inquiry proofs in the background
      // so the page never blocks on this wall of document reads.
      try {
        const uniqueReviewerIds = [
          ...new Set(baseReviews.map((r) => r.reviewerId).filter(Boolean)),
        ];

        const reviewerMap = new Map();
        const pendingReviewers = [];

        uniqueReviewerIds.forEach((uid) => {
          const cached = getCachedUserProfile(uid);
          if (cached) {
            reviewerMap.set(uid, cached);
          } else {
            pendingReviewers.push(uid);
          }
        });

        const fetchedReviewers = await mapWithConcurrency(
          pendingReviewers,
          MAX_CONCURRENCY,
          async (uid) => {
            try {
              return [uid, await getUserProfile(uid)];
            } catch {
              return [uid, null];
            }
          },
        );

        fetchedReviewers.forEach(([uid, profile]) => {
          if (profile) reviewerMap.set(uid, profile);
        });

        const neededInquiryIds = [
          ...new Set(
            baseReviews
              .filter((r) => !r.proof?.url && r.inquiryId)
              .map((r) => r.inquiryId),
          ),
        ];

        const inquiryDocs = await mapWithConcurrency(
          neededInquiryIds,
          MAX_CONCURRENCY,
          async (inqId) => {
            try {
              return [inqId, await getInquiry(inqId)];
            } catch {
              return [inqId, null];
            }
          },
        );

        const inquiryMap = new Map(
          inquiryDocs.filter(([, inq]) => inq != null),
        );

        if (cancelled) return;

        const enrichedReviews = baseReviews.map((review) => ({
          ...review,
          reviewer:
            reviewerMap.get(review.reviewerId) || {
              fullname: review.reviewerName || "Verified Buyer",
              profilePicture: review.reviewerAvatar || "",
            },
          inquiry:
            inquiryMap.get(review.inquiryId) ||
            (review.proof ? { proof: review.proof } : null),
        }));

        if (cancelled) return;

        setReviews(enrichedReviews);
      } catch (err) {
        console.error("Failed to enrich product reviews:", err);
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