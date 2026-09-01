import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getProductById } from "../services/product.service";
import { getFarmerById } from "../services/farmer.service";
import * as pageCache from "../utils/pageCache";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function useProductDetails() {
  const { id } = useParams();

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingFarmer, setLoadingFarmer] = useState(false);

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
      setLoadingProduct(true);

      // Check cache first
      const cacheKey = `product:${id}`;
      const cached = pageCache.get(cacheKey);
      if (cached) {
        setProduct(cached.product);
        setReviewCount(cached.reviewCount);
        setAverageRating(cached.averageRating);

        if (cached.product.farmerId) {
          setLoadingFarmer(true);
          getFarmerById(cached.product.farmerId)
            .then(setFarmer)
            .catch(() => setFarmer(null))
            .finally(() => setLoadingFarmer(false));
        }

        setLoadingProduct(false);
        return;
      }

      const productData = await getProductById(id);

      if (!productData) {
        setProduct(null);
        return;
      }

      const reviewCount = Number(
        productData.ratingSummary?.count ?? productData.reviewCount ?? 0,
      );
      const averageRating = Number(
        productData.ratingSummary?.average ?? productData.productRating ?? 0,
      );

      setProduct(productData);
      setReviewCount(reviewCount);
      setAverageRating(averageRating);

      // Cache the product data
      pageCache.set(cacheKey, { product: productData, reviewCount, averageRating }, CACHE_TTL);

      if (productData.farmerId) {
        setLoadingFarmer(true);
        getFarmerById(productData.farmerId)
          .then(setFarmer)
          .catch(() => setFarmer(null))
          .finally(() => setLoadingFarmer(false));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingProduct(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  return {
    loading: loadingProduct,
    loadingFarmer,

    product,
    farmer,

    reviewCount,
    averageRating,

    hasImages,
    primaryImage,
    isAvailable,

    refresh: () => {
      pageCache.invalidate(`product:${id}`);
      loadProduct();
    },
  };
}
