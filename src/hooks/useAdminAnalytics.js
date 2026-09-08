import { useMemo } from "react";

import {
  apiGetUserGrowth,
  apiGetProductAnalytics,
  apiGetTransactionAnalytics,
  apiGetCategoryDistribution,
} from "../services/admin.service";

import useAnalytics from "./useAnalytics";
import {
  getRangeForPreset,
  DEFAULT_RANGE_PRESET,
} from "../utils/analyticsDateRange";

/**
 * Loads all admin dashboard analytics for a selected date-range preset.
 * Each series is cached independently (per key + range).
 */
export default function useAdminAnalytics(range = DEFAULT_RANGE_PRESET) {
  const rangeParams = useMemo(() => getRangeForPreset(range), [range]);

  const userGrowth = useAnalytics({
    cacheKey: "adminUserGrowth",
    fetcher: apiGetUserGrowth,
    range: rangeParams,
  });

  const productAnalytics = useAnalytics({
    cacheKey: "adminProductAnalytics",
    fetcher: apiGetProductAnalytics,
    range: rangeParams,
  });

  const transactionAnalytics = useAnalytics({
    cacheKey: "adminTransactionAnalytics",
    fetcher: apiGetTransactionAnalytics,
    range: rangeParams,
  });

  const categoryDistribution = useAnalytics({
    cacheKey: "adminCategoryDistribution",
    fetcher: apiGetCategoryDistribution,
    range: rangeParams,
  });

  return { rangeParams, userGrowth, productAnalytics, transactionAnalytics, categoryDistribution };
}
