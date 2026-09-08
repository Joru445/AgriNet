import { useMemo } from "react";

import {
  apiGetFarmerInquiryAnalytics,
  apiGetFarmerProductAnalytics,
} from "../services/farmer.service";

import useAnalytics from "./useAnalytics";
import {
  getRangeForPreset,
  DEFAULT_RANGE_PRESET,
} from "../utils/analyticsDateRange";

/**
 * Loads the authenticated farmer's dashboard analytics for a selected
 * date-range preset. Farmer identity is taken from the backend token.
 */
export default function useFarmerAnalytics(range = DEFAULT_RANGE_PRESET) {
  const rangeParams = useMemo(() => getRangeForPreset(range), [range]);

  const inquiryAnalytics = useAnalytics({
    cacheKey: "farmerInquiryAnalytics",
    fetcher: apiGetFarmerInquiryAnalytics,
    range: rangeParams,
  });

  const productAnalytics = useAnalytics({
    cacheKey: "farmerProductAnalytics",
    fetcher: apiGetFarmerProductAnalytics,
    range: rangeParams,
  });

  return { rangeParams, inquiryAnalytics, productAnalytics };
}
