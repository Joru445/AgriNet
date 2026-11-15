import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getReviewsByProduct, getProductReviewProofs } from "../services/product-review.service";
import { getUserProfile } from "../services/user.service";
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

function attachFallbacks(reviews, proofs) {
  return reviews.map((review) => {
    const inqId = review.inquiryId || review.id || review.inquiry?.id;
    const verifiedProof = inqId && proofs ? (proofs[inqId] || null) : null;
    const proofUrl =
      review.proof?.url || review.inquiry?.proof?.url || verifiedProof || null;

    return {
      ...review,
      reviewer: review.reviewer || {
        fullname: review.reviewerName || "Verified Buyer",
        profilePicture: review.reviewerAvatar || "",
      },
      inquiry:
        review.inquiry || (proofUrl ? { proof: { url: proofUrl } } : null),
      proof: review.proof || (proofUrl ? { url: proofUrl } : null),
    };
  });
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
      try {
        setLoading(true);
        setError(null);

        const baseReviews = await getReviewsByProduct(productId);

        if (cancelled) return;

        // Proof photos are served by an authenticated API instead of the
        // previous hard-coded registry and cross-account impersonation.
        let proofs = {};
        try {
          proofs = await getProductReviewProofs(productId);
        } catch {
          proofs = {};
        }

        if (cancelled) return;

        // Paint the review section right away from the single base query.
        setReviews(attachFallbacks(baseReviews, proofs));
        setLoading(false);

        // Enrich reviewer profiles in the background.
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

          if (cancelled) return;

          const enrichedReviews = baseReviews.map((review) => ({
            ...attachFallbacks([review], proofs)[0],
            reviewer:
              reviewerMap.get(review.reviewerId) || {
                fullname: review.reviewerName || "Verified Buyer",
                profilePicture: review.reviewerAvatar || "",
              },
          }));

          if (cancelled) return;
          setReviews(enrichedReviews);
        } catch (err) {
          console.error("Failed to enrich product reviews:", err);
        }
      } catch (err) {
        if (!cancelled) {
          setReviews([]);
          setError(err.message || "Failed to load product reviews.");
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