import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getProductById } from "../services/product.service";
import { getFarmerById } from "../services/farmer.service";

import {
  getProductReviews,
  getProductReviewCount,
  getAverageProductRating,
} from "../services/product-review.service";

export default function useProductDetails() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [product, setProduct] = useState(null);
  const [farmer, setFarmer] = useState(null);

  const [reviews, setReviews] = useState([]);

  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const hasImages = product?.images?.length > 0;

  const primaryImage = hasImages ? product.images[0] : null;

  const isAvailable = product?.available === true;

  useEffect(() => {
    if (!id) return;

    loadProduct();
  }, [id]);

  async function loadProduct() {
    try {
      setLoading(true);

      const product = await getProductById(id);

      if (!product) {
        setProduct(null);
        return;
      }

      const [farmer, reviews, reviewCount, averageRating] = await Promise.all([
        getFarmerById(product.farmerId),
        getProductReviews(product.id),
        getProductReviewCount(product.id),
        getAverageProductRating(product.id),
      ]);

      setProduct(product);
      setFarmer(farmer);

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

    product,
    farmer,

    reviews,

    reviewCount,
    averageRating,

    hasImages,
    primaryImage,
    isAvailable,

    refresh: loadProduct,
  };
}
