import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getProductById } from "../services/product.service";
import { getFarmerById } from "../services/farmer.service";

export default function useProductDetails() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [product, setProduct] = useState(null);
  const [farmer, setFarmer] = useState(null);

  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const hasImages = product?.images?.length > 0;
  const primaryImage = hasImages ? product.images[0] : null;
  const isAvailable = product?.available === true;

  const loadProduct = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      const product = await getProductById(id);

      if (!product) {
        setProduct(null);
        return;
      }

      const farmer = product.farmerId
        ? await getFarmerById(product.farmerId).catch(() => null)
        : null;

      const reviewCount = Number(
        product.ratingSummary?.count ?? product.reviewCount ?? 0,
      );
      const averageRating = Number(
        product.ratingSummary?.average ?? product.productRating ?? 0,
      );

      setProduct(product);
      setFarmer(farmer);
      setReviewCount(reviewCount);
      setAverageRating(averageRating);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

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
