import { useCallback, useEffect, useState } from "react";

import * as pageCache from "../utils/pageCache";

const CACHE_TTL = 2 * 60 * 1000;

/**
 * Generic analytics-data hook with per-key + range caching and range-driven
 * refetch. `fetcher` is an async function that accepts a range `{from, to}`
 * and returns the backend analytics payload. When `rangeKey` changes the data
 * is reloaded; `refresh()` bypasses the cache.
 */
export default function useAnalytics({
  cacheKey,
  fetcher,
  range,
  enabled = true,
  initialData = null,
}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(
    async ({ useCache = true } = {}) => {
      if (!enabled) return;

      const cacheId = `${cacheKey}:${range?.from}:${range?.to}`;
      if (useCache) {
        const cached = pageCache.get(cacheId);
        if (cached) {
          setData(cached);
          setLoading(false);
          setError(null);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetcher(range);
        setData(result);
        pageCache.set(cacheId, result, CACHE_TTL);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [cacheKey, range, enabled, fetcher],
  );

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    refresh: () => load({ useCache: false }),
  };
}
