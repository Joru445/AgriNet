import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getFarmerById } from "../services/farmer.service";
import { getFarmerProducts } from "../services/product.service";
import { getFarmerReviews } from "../services/farmer-review.service";
import { getProductReviewSummaries } from "../services/product-review.service";

export default function useStoreProfile() {
  const { uid } = useParams();

  const [loadingFarmer, setLoadingFarmer] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const loadFarmer = useCallback(async () => {
    if (!uid) {
      setLoadingFarmer(false);
      return;
    }

    try {
      setLoadingFarmer(true);
      const farmerData = await getFarmerById(uid);
      setFarmer(farmerData);
    } catch (error) {
      console.error("Failed to load farmer profile:", error);
    } finally {
      setLoadingFarmer(false);
    }
  }, [uid]);

  const loadProducts = useCallback(async () => {
    if (!uid) {
      setLoadingProducts(false);
      return;
    }

    try {
      setLoadingProducts(true);
      const productsData = await getFarmerProducts(uid);

      const productIds = productsData.map((product) => product.id);
      const reviewSummaries = await getProductReviewSummaries(productIds);

      const productsWithRatings = productsData.map((product) => {
        const summary = reviewSummaries.get(product.id);
        return {
          ...product,
          productRating: summary?.average ?? 0,
          reviewCount: summary?.count ?? 0,
        };
      });

      setProducts(productsWithRatings);
    } catch (error) {
      console.error("Failed to load store products:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, [uid]);

  const loadReviews = useCallback(async () => {
    if (!uid) {
      setLoadingReviews(false);
      return;
    }

    try {
      setLoadingReviews(true);
      const reviewsData = await getFarmerReviews(uid);

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

      setReviews(reviewsData);
      setReviewCount(Number(reviewCountData) || 0);
      setAverageRating(Number(averageRatingData) || 0);
    } catch (error) {
      console.error("Failed to load store reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  }, [uid]);

  useEffect(() => {
    loadFarmer();
    loadProducts();
    loadReviews();
  }, [loadFarmer, loadProducts, loadReviews]);

  const loading = loadingFarmer;

  return {
    loading,
    loadingProducts,
    loadingReviews,

    farmer,

    products,

    reviews,

    averageRating,

    reviewCount,

    refresh: () => {
      loadFarmer();
      loadProducts();
      loadReviews();
    },
  };
}
