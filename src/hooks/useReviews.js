import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";

import { getFarmerReviews, enrichFarmerReviews } from "../services/farmer-review.service";

import { showToast } from "../utils/toast";

export default function useReviews() {
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);

  const loadReviews = useCallback(async () => {
    if (!profile?.uid) return;

    try {
      setLoading(true);

      const data = await getFarmerReviews(profile.uid);

      // Paint base reviews immediately; profiles fill in in the background.
      setReviews(data);

      enrichFarmerReviews(data)
        .then((enriched) => setReviews(enriched))
        .catch(() => {
          /* noop */
        });
    } catch (error) {
      console.error(error);

      showToast.error("Failed to load reviews.");
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
