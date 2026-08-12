import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getFarmerById } from "../services/farmer.service";
import { getFarmerProducts } from "../services/product.service";

import {
  getFarmerReviews,
  getFarmerReviewCount,
  getAverageFarmerRating,
} from "../services/farmer-review.service";

export default function useStoreProfile() {
  const { uid } = useParams();

  const [loading, setLoading] = useState(true);

  const [farmer, setFarmer] = useState(null);

  const [products, setProducts] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState([]);
  const [averageRating, setAverageRating] = useState([]);

  const loadStore = useCallback(async () => {
    if (!uid) return;

    try {
      setLoading(true);

      const [farmer, products, reviews, reviewCount, averageRating] =
        await Promise.all([
          getFarmerById(uid),
          getFarmerProducts(uid),
          getFarmerReviews(uid),
          getFarmerReviewCount(uid),
          getAverageFarmerRating(uid),
        ]);

      const productsWithRatings = products.map((product) => ({
        ...product,
        reviewCount: Number(product.ratingSummary?.count ?? 0),
        productRating: Number(product.ratingSummary?.average ?? 0),
      }));

      setFarmer(farmer);
      setProducts(productsWithRatings);
      setReviews(reviews);
      setReviewCount(reviewCount);
      setAverageRating(averageRating);
    } catch (error) {
      console.error(error);
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
