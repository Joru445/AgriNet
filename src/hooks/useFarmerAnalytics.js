import { useCallback, useEffect, useMemo } from "react";

import {
  apiGetFarmerInquiryAnalytics,
  apiGetFarmerProductAnalytics,
} from "../services/farmer.service";
import { apiGetFarmerProducts } from "../services/product.service";

import useAnalytics from "./useAnalytics";
import { useAuth } from "../context/AuthContext";
import {
  getRangeForPreset,
  DEFAULT_RANGE_PRESET,
} from "../utils/analyticsDateRange";
import * as pageCache from "../utils/pageCache";

/**
 * Loads the authenticated farmer's dashboard analytics for a selected
 * date-range preset. Farmer identity is taken from the backend token.
 */
export default function useFarmerAnalytics(range = DEFAULT_RANGE_PRESET) {
  const { profile } = useAuth();
  const rangeParams = useMemo(() => getRangeForPreset(range), [range]);

  const inquiryAnalytics = useAnalytics({
    cacheKey: "farmerInquiryAnalytics",
    fetcher: apiGetFarmerInquiryAnalytics,
    range: rangeParams,
  });

  const productAnalyticsFetcher = useCallback(async () => {
    try {
      const [backendAnalytics, activeProducts] = await Promise.all([
        apiGetFarmerProductAnalytics().catch(() => null),
        profile?.uid ? apiGetFarmerProducts(profile.uid).catch(() => null) : null,
      ]);

      if (Array.isArray(activeProducts)) {
        const catMap = {};
        activeProducts.forEach((p) => {
          const cat = (p.category || "others").toLowerCase();
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
        const categories = Object.entries(catMap).map(([category, count]) => ({
          category,
          count,
        }));
        const sellingMode = {
          available: activeProducts.filter(
            (p) => p.sellingMode !== "preorder" && p.available !== false,
          ).length,
          preorder: activeProducts.filter((p) => p.sellingMode === "preorder").length,
        };
        return { categories, sellingMode };
      }

      return backendAnalytics ?? { categories: [], sellingMode: {} };
    } catch (err) {
      console.warn("Product analytics error:", err);
      return { categories: [], sellingMode: {} };
    }
  }, [profile?.uid]);

  const productAnalytics = useAnalytics({
    cacheKey: `farmerProductAnalytics:${profile?.uid || "anon"}`,
    fetcher: productAnalyticsFetcher,
    range: rangeParams,
  });

  useEffect(() => {
    const handleProductsUpdated = () => {
      if (profile?.uid) {
        pageCache.invalidatePrefix(`farmerProductAnalytics:${profile.uid}`);
      }
      productAnalytics.refresh();
    };

    window.addEventListener("agrinet:farmer-products-updated", handleProductsUpdated);
    const handleStorage = (e) => {
      if (e.key === "agrinet_farmer_products_sync") {
        handleProductsUpdated();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("agrinet:farmer-products-updated", handleProductsUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, [profile?.uid, productAnalytics]);

  return { rangeParams, inquiryAnalytics, productAnalytics };
}
