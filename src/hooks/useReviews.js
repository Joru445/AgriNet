import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "../context/AuthContext";

import { getFarmerReviews, enrichFarmerReviews } from "../services/farmer-review.service";
import { accountCacheKey, getAccountCache, setAccountCache } from "../utils/accountQueryCache";

export default function useReviews() {
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const reviewsRef = useRef(reviews);
  useEffect(() => {
    reviewsRef.current = reviews;
  }, [reviews]);

  const loadReviews = useCallback(async () => {
    if (!profile?.uid) return;

    try {
      // Keep existing review rows and summary visible while revalidating.
      setLoading(reviewsRef.current.length === 0);

      const key = accountCacheKey(profile.uid, "farmer-reviews");
      const cached = getAccountCache(key, 5 * 60 * 1000);
      const data = cached || await getFarmerReviews(profile.uid);
      const safeData = Array.isArray(data) ? data : [];
      if (!cached) setAccountCache(key, safeData);

      // Paint base reviews immediately; profiles fill in in the background.
      setReviews(safeData);

      enrichFarmerReviews(safeData)
        .then((enriched) => setReviews(Array.isArray(enriched) ? enriched : safeData))
        .catch(() => {
          /* noop */
        });
    } catch (error) {
      console.error("[useReviews] Failed to load reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [profile?.uid]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const reviewCount = useMemo(() => {
    return reviews.length;
  }, [reviews]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;

    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating),
      0,
    );

    return Number((total / reviews.length).toFixed(1));
  }, [reviews]);

  const distribution = useMemo(() => {
    return reviews.reduce(
      (result, review) => {
        result[review.rating]++;

        return result;
      },
      {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    );
  }, [reviews]);

  function getPercentage(stars) {
    if (!reviewCount) return 0;

    return (distribution[stars] / reviewCount) * 100;
  }

  return {
    loading,

    reviews,

    reviewCount,
    averageRating,

    distribution,
    getPercentage,

    reloadReviews: loadReviews,
  };
}
