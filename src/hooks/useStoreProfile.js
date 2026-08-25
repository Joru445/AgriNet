import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getFarmerById } from "../services/farmer.service";
import { getFarmerProducts } from "../services/product.service";
import { getFarmerReviews } from "../services/farmer-review.service";
import { getProductReviewSummaries } from "../services/product-review.service";

export default function useStoreProfile() {
  const { uid } = useParams();

  const [loading, setLoading] = useState(true);

  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const loadStore = useCallback(async () => {
    if (!uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [
        farmerData,
        productsData,
        reviewsData,
      ] = await Promise.all([
        getFarmerById(uid),
        getFarmerProducts(uid),
        getFarmerReviews(uid),
      ]);

      const reviewCountData = reviewsData.length;
      const averageRatingData =
        reviewCountData > 0
          ? Number(
              (
                reviewsData.reduce(
                  (sum, r) => sum + Number(r.rating || 0),
                  0,
                ) / reviewCountData
              ).toFixed(1),
            )
          : 0;

      /*
       * Get all product IDs belonging to this farmer.
       */
      const productIds = productsData.map((product) => product.id);

      /*
       * Load review summaries from product-reviews collection.
       *
       * Returns a Map:
       *
       * productId => {
       *   average,
       *   count
       * }
       */
      const reviewSummaries = await getProductReviewSummaries(productIds);

      /*
       * Attach review data directly to every product.
       */
      const productsWithRatings = productsData.map((product) => {
        const summary = reviewSummaries.get(product.id);

        return {
          ...product,

          productRating: summary?.average ?? 0,

          reviewCount: summary?.count ?? 0,
        };
      });

      setFarmer(farmerData);

      setProducts(productsWithRatings);

      setReviews(reviewsData);

      setReviewCount(Number(reviewCountData) || 0);

      setAverageRating(Number(averageRatingData) || 0);
    } catch (error) {
      console.error("Failed to load store profile:", error);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    loadStore();
  }, [loadStore]);

  return {
    loading,

    farmer,

    products,

    reviews,

    averageRating,

    reviewCount,

    refresh: loadStore,
  };
}
