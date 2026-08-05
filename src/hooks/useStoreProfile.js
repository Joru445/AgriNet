import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getFarmerById } from "../services/farmer.service";
import { getFarmerProducts } from "../services/product.service";

import {
  getProductReviewCount,
  getAverageProductRating,
} from "../services/product-review.service";

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

  const [productReviewCount] = useState([]);
  const [averageProductRating] = useState([]);

  useEffect(() => {
    if (!uid) return;

    loadStore();
  }, [uid]);

  async function loadStore() {
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

      const productsWithRatings = await Promise.all(
        products.map(async (product) => {
          const [reviewCount, productRating] = await Promise.all([
            getProductReviewCount(product.id),
            getAverageProductRating(product.id),
          ]);

          return {
            ...product,
            reviewCount,
            productRating,
          };
        }),
      );

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
  }

  return {
    loading,

    farmer,

    products,
    reviews,

    averageRating,
    reviewCount,

    averageProductRating,
    productReviewCount,

    refresh: loadStore,
  };
}
