import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getMarketplaceProductsPage } from "../services/product.service";
import useUserLocation from "./useUserLocation";
import { getDistanceKm } from "../utils/distance";
import { isProductExpired } from "../utils/productExpiration";
import { showToast } from "../utils/toast";
import * as pageCache from "../utils/pageCache";

const HOME_PRODUCT_LIMIT = 12;
const NEARBY_RADIUS_KM = 5;
const CACHE_KEY = "homeProducts";
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export default function useHomeProducts() {
  const { location: userLocation } = useUserLocation();

  const [products, setProducts] = useState(() => pageCache.get(CACHE_KEY) ?? []);
  const [loading, setLoading] = useState(!pageCache.get(CACHE_KEY));
  const [now, setNow] = useState(() => Date.now());
  const loadedRef = useRef(!!pageCache.get(CACHE_KEY));

  // Auto-tick every second so expired listings disappear immediately without refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadProducts = useCallback(async ({ useCache = true } = {}) => {
    try {
      const cached = useCache ? pageCache.get(CACHE_KEY) : null;
      if (cached) {
        setProducts(cached);
        setLoading(false);
        return;
      }

      setLoading(true);

      const result = await getMarketplaceProductsPage({
        cursor: null,
        limit: HOME_PRODUCT_LIMIT,
      });

      const data = result.products ?? [];
      setProducts(data);
      pageCache.set(CACHE_KEY, data, CACHE_TTL);
      loadedRef.current = true;
    } catch (error) {
      console.error(error);
      showToast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /*
   * Add calculated distance to every product.
   */
  const marketplaceProducts = useMemo(() => {
    return products.map((product) => {
      const lat = product.farmer?.location?.lat;
      const lng = product.farmer?.location?.lng;

      if (!userLocation || lat == null || lng == null) {
        return {
          ...product,
          distance: null,
        };
      }

      return {
        ...product,
        distance: getDistanceKm(userLocation.lat, userLocation.lng, lat, lng),
      };
    });
  }, [products, userLocation]);

  /*
   * Only show products that are actually purchasable and unexpired.
   */
  const availableProducts = useMemo(() => {
    return marketplaceProducts.filter((product) => {
      const stock = Number(product.stock ?? 0);

      return (
        product.available !== false && stock > 0 && !isProductExpired(product)
      );
    });
  }, [marketplaceProducts]);

  /*
   * Nearby products
   */
  const nearbyProducts = useMemo(() => {
    if (!userLocation) return [];

    return availableProducts
      .filter(
        (product) =>
          product.distance != null && product.distance <= NEARBY_RADIUS_KM,
      )
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);
  }, [availableProducts, userLocation]);

  /*
   * Recently added products
   */
  const recentProducts = useMemo(() => {
    return [...availableProducts]
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      .slice(0, 6);
  }, [availableProducts]);

  /*
   * Relevant products
   *
   * This is an initial relevance model.
   * It favors:
   * - availability
   * - higher ratings
   * - nearby farmers
   * - newer products
   */
  const relevantProducts = useMemo(() => {
    return [...availableProducts]
      .map((product) => {
        const rating = Number(product.productRating ?? 0);

        const createdAt =
          product.createdAt?.toDate?.()?.getTime?.() ??
          (product.createdAt?.seconds ?? 0) * 1000;

        const ageDays = Math.max(0, (now - createdAt) / (1000 * 60 * 60 * 24));

        /*
         * Rating score: 0 - 40
         */
        const ratingScore = Math.min(rating / 5, 1) * 40;

        /*
         * Distance score: 0 - 30
         */
        let distanceScore = 0;

        if (product.distance != null) {
          distanceScore = Math.max(0, 1 - product.distance / 20) * 30;
        }

        /*
         * Freshness score: 0 - 30
         */
        const freshnessScore = Math.max(0, 1 - ageDays / 30) * 30;

        const relevanceScore = ratingScore + distanceScore + freshnessScore;

        return {
          ...product,
          relevanceScore,
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6);
  }, [availableProducts, now]);

  return {
    loading,

    products: marketplaceProducts,

    nearbyProducts,
    recentProducts,
    relevantProducts,

    userLocation,

    reloadProducts: () => loadProducts({ useCache: false }),
  };
}
