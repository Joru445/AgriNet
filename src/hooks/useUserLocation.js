import { useCallback, useEffect, useState } from "react";

import { getCurrentPosition, reverseGeocode } from "../utils/location";
import {
  getCachedLocation,
  getStaleCachedLocation,
  setCachedLocation,
} from "../utils/locationCache";

/**
 * Module-level in-flight guard so multiple hook instances (e.g. Home,
 * Nearby, Marketplace) never issue duplicate geolocation requests when they
 * mount close together. Shared across all `useUserLocation` callers.
 */
let inFlightRefresh = null;

export default function useUserLocation(autoLoad = true) {
  // Seed state from cache: prefer a fresh position, else any earlier position
  // so we can render immediately and refresh in the background.
  const [freshAtStart] = useState(() => getCachedLocation());
  const [staleAtStart] = useState(() => getStaleCachedLocation());
  const cachedAtStart = freshAtStart || staleAtStart;

  const [location, setLocation] = useState(
    cachedAtStart
      ? {
          lat: cachedAtStart.lat,
          lng: cachedAtStart.lng,
          timestamp: cachedAtStart.timestamp,
        }
      : null,
  );
  const [loadingLocation, setLoadingLocation] = useState(
    autoLoad && !cachedAtStart,
  );
  const [locationError, setLocationError] = useState(null);

  /**
   * Resolves a fresh position + reverse-geocoded address. Does NOT consult
   * the cache; the caller decides whether to use cached data.
   */
  const fetchFresh = useCallback(async () => {
    const position = await getCurrentPosition();
    const address = await reverseGeocode(position.lat, position.lng);
    return { ...position, address };
  }, []);

  /**
   * Shared fetch routine. When `background` is true the loading flag is not
   * raised, so pages keep rendering from the (stale) cached location while a
   * newer position is obtained.
   */
  const runRefresh = useCallback(
    async ({ background = false } = {}) => {
      if (inFlightRefresh) return inFlightRefresh;

      inFlightRefresh = (async () => {
        if (!background) setLoadingLocation(true);
        setLocationError(null);

        try {
          const fresh = await fetchFresh();
          setCachedLocation(fresh);
          setLocation(fresh);
          return fresh;
        } catch (error) {
          console.warn("Location not available:", error.message || error);

          const stale = getStaleCachedLocation();
          if (stale) {
            setLocation(stale);
            setLocationError(null);
            return stale;
          }

          setLocationError(error);
          return null;
        } finally {
          inFlightRefresh = null;
          setLoadingLocation(false);
        }
      })();

      return inFlightRefresh;
    },
    [fetchFresh],
  );

  /**
   * Public API: bypasses the normal cache and requests a fresh location.
   * Shows the loading state while resolving.
   */
  const refreshLocation = useCallback(
    () => runRefresh({ background: false }),
    [runRefresh],
  );

  useEffect(() => {
    if (!autoLoad) return;

    if (freshAtStart) {
      // Fresh cache: use immediately, no re-request.
      setLoadingLocation(false);
      setLocationError(null);
      return;
    }

    if (staleAtStart) {
      // Stale cache: render immediately; refresh in the background.
      setLocationError(null);
      runRefresh({ background: true });
      return;
    }

    // No cache: request geolocation (deduped globally).
    refreshLocation();
  }, [autoLoad, freshAtStart, staleAtStart, refreshLocation, runRefresh]);

  return {
    location,
    loadingLocation,
    locationError,
    refreshLocation,
    setLocation,
  };
}