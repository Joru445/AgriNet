import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { apiGetMarketplaceProducts } from "../services/product.service";
import { getGroups, getGroupMembers, getUserApprovedGroups } from "../services/group.service";
import useUserLocation from "./useUserLocation";
import { getDistanceKm } from "../utils/distance";
import { isProductExpired } from "../utils/productExpiration";
import { isProductBuyable, getProductInquiryState } from "../utils/productStatus";
import * as pageCache from "../utils/pageCache";

const PRODUCTS_PER_PAGE = 12;
const BACKEND_PAGE_SIZE = 24;
const CACHE_KEY = "marketplaceProducts";
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const DISCOVERY_NEARBY_RADIUS_KM = 5;
const DISCOVERY_SECTION_SIZE = 4;
const DISCOVERY_RECOMMENDED_SIZE = 6;

/**
 * Enriches products with their farmer's approved group affiliations.
 * Uses cached results when available to minimize network calls.
 */
async function enrichProductsWithFarmerGroups(rawProducts) {
  if (!Array.isArray(rawProducts) || rawProducts.length === 0) return rawProducts;

  const farmerIds = [
    ...new Set(
      rawProducts
        .map((p) => p.farmerId || p.farmer?.uid || p.farmer?.id)
        .filter(Boolean),
    ),
  ];

  if (farmerIds.length === 0) return rawProducts;

  const farmerGroupsMap = new Map();
  await Promise.all(
    farmerIds.map(async (fId) => {
      try {
        const groups = await getUserApprovedGroups(fId);
        farmerGroupsMap.set(fId, Array.isArray(groups) ? groups : []);
      } catch {
        farmerGroupsMap.set(fId, []);
      }
    }),
  );

  return rawProducts.map((p) => {
    const fId = p.farmerId || p.farmer?.uid || p.farmer?.id;
    const groups = farmerGroupsMap.get(fId) || p.farmer?.groups || [];
    return {
      ...p,
      farmer: p.farmer
        ? { ...p.farmer, groups }
        : { uid: fId, groups },
    };
  });
}

/**
 * Compute a relevance score for a product.
 * Relevance = rating (0-40) + distance (0-30) + freshness (0-30).
 */
function scoreRelevance(product, now) {
  const rating = Number(product.productRating ?? 0);

  const createdAt =
    product.createdAt?.toDate?.()?.getTime?.() ??
    (product.createdAt?.seconds ?? 0) * 1000;

  const ageDays = Math.max(0, (now - createdAt) / (1000 * 60 * 60 * 24));

  const ratingScore = Math.min(rating / 5, 1) * 40;

  const distanceScore =
    product.distance != null
      ? Math.max(0, 1 - product.distance / 20) * 30
      : 0;

  const freshnessScore = Math.max(0, 1 - ageDays / 30) * 30;

  return ratingScore + distanceScore + freshnessScore;
}

const DEFAULT_FILTERS = {
  search: "",
  category: "All",
  distance: 10,
  minPrice: 0,
  maxPrice: 0,
  rating: 0,
  sort: "relevant",
  showUnavailable: false,
  sellingMode: "all",
  group: "",
};

/**
 * Apply client-side filters (search, distance, price, rating, availability)
 * to a product list.  These filters require runtime data the backend does
 * not have (user location, instant-search UX, cross-field price/range).
 */
function applyClientFilters(
  products,
  filters,
  userLocation,
  groupFarmerIds = new Set(),
  allGroups = [],
) {
  let data = [...products];

  if (filters.search.trim()) {
    const keyword = filters.search.trim().toLowerCase();
    data = data.filter(
      (product) =>
        product.name?.toLowerCase().includes(keyword) ||
        product.category?.toLowerCase().includes(keyword) ||
        product.farmer?.fullname?.toLowerCase().includes(keyword) ||
        product.farmer?.username?.toLowerCase().includes(keyword) ||
        product.farmer?.storeName?.toLowerCase().includes(keyword),
    );
  }

  // Filter by category
  if (filters.category && filters.category !== "All") {
    const targetCat = filters.category.toLowerCase();
    data = data.filter((product) => {
      const pCat = String(product.category || "").toLowerCase();
      if (targetCat === "others" || targetCat === "other") {
        return pCat === "others" || pCat === "other";
      }
      return pCat === targetCat;
    });
  }

  // Filter by selected Group / Organization
  if (filters.group && String(filters.group).trim() !== "") {
    const target = String(filters.group).trim().toLowerCase();
    const matchedGroup = allGroups.find(
      (g) =>
        String(g.name || "").trim().toLowerCase() === target ||
        String(g.id || "") === String(filters.group),
    );
    const targetGroupId = matchedGroup?.id || filters.group;
    const targetGroupName = String(matchedGroup?.name || filters.group).trim().toLowerCase();

    data = data.filter((product) => {
      // 1. Check if the product's farmer is an approved member of this group
      const farmerId = product.farmerId || product.farmer?.uid || product.farmer?.id;
      if (farmerId && groupFarmerIds.has(farmerId)) {
        return true;
      }

      // 2. Direct product group identifiers
      if (
        (product.groupId &&
          (String(product.groupId) === String(targetGroupId) ||
            String(product.groupId).toLowerCase() === targetGroupName)) ||
        (product.groupName &&
          String(product.groupName).toLowerCase() === targetGroupName) ||
        (product.organization &&
          String(product.organization).toLowerCase() === targetGroupName) ||
        (product.organizationId &&
          String(product.organizationId) === String(targetGroupId))
      ) {
        return true;
      }

      // 3. String or object product.group
      if (typeof product.group === "string") {
        const pGroup = String(product.group).trim().toLowerCase();
        if (pGroup === targetGroupName || product.group === targetGroupId) return true;
      } else if (product.group && typeof product.group === "object") {
        if (
          String(product.group.id || "") === String(targetGroupId) ||
          String(product.group.groupId || "") === String(targetGroupId) ||
          String(product.group.name || "").toLowerCase() === targetGroupName ||
          String(product.group.groupName || "").toLowerCase() === targetGroupName
        ) {
          return true;
        }
      }

      // 4. Array product.groups
      if (Array.isArray(product.groups) && product.groups.length > 0) {
        const hasMatch = product.groups.some((g) => {
          if (typeof g === "string") {
            const str = g.toLowerCase();
            return str === targetGroupName || g === targetGroupId;
          }
          return (
            String(g?.groupId || "") === String(targetGroupId) ||
            String(g?.id || "") === String(targetGroupId) ||
            String(g?.groupName || "").toLowerCase() === targetGroupName ||
            String(g?.name || "").toLowerCase() === targetGroupName
          );
        });
        if (hasMatch) return true;
      }

      // 5. Farmer's groups array or object
      if (Array.isArray(product.farmer?.groups) && product.farmer.groups.length > 0) {
        const hasFarmerGroup = product.farmer.groups.some((g) => {
          if (typeof g === "string") {
            const str = g.trim().toLowerCase();
            return str === targetGroupName || g.trim() === targetGroupId;
          }
          return (
            String(g?.groupId || g?.id || "").trim() === targetGroupId ||
            String(g?.groupName || g?.name || "").trim().toLowerCase() === targetGroupName
          );
        });
        if (hasFarmerGroup) return true;
      }

      if (typeof product.farmer?.group === "string") {
        const fGroup = String(product.farmer.group).trim().toLowerCase();
        if (fGroup === targetGroupName || product.farmer.group === targetGroupId) return true;
      } else if (product.farmer?.group && typeof product.farmer.group === "object") {
        if (
          String(product.farmer.group.id || "") === String(targetGroupId) ||
          String(product.farmer.group.groupId || "") === String(targetGroupId) ||
          String(product.farmer.group.name || "").toLowerCase() === targetGroupName ||
          String(product.farmer.group.groupName || "").toLowerCase() === targetGroupName
        ) {
          return true;
        }
      }

      return false;
    });
  }

  data = data.filter((product) => {
    if (isProductExpired(product)) return false;

    if (!filters.showUnavailable && !isProductBuyable(product)) return false;

    const price = Number(product.price ?? 0);
    const rating = Number(product.productRating ?? 0);
    const matchesMinPrice = filters.minPrice > 0 ? price >= filters.minPrice : true;
    const matchesMaxPrice = filters.maxPrice > 0 ? price <= filters.maxPrice : true;
    const matchesDistance =
      !userLocation ||
      product.distance == null ||
      product.distance <= filters.distance;
    const matchesRating = rating >= filters.rating;

    return matchesMinPrice && matchesMaxPrice && matchesDistance && matchesRating;
  });

  return data;
}

export default function useMarketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location: userLocation } = useUserLocation();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState(() => pageCache.get(CACHE_KEY) ?? []);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const cursorRef = useRef(null);
  const loadingMoreRef = useRef(false);

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") ?? DEFAULT_FILTERS.search,
      category: searchParams.get("category") ?? DEFAULT_FILTERS.category,
      distance: Number(
        searchParams.get("distance") ??
          localStorage.getItem("agri_consumer_distance") ??
          DEFAULT_FILTERS.distance,
      ),
      minPrice: Number(
        searchParams.get("minPrice") ?? DEFAULT_FILTERS.minPrice,
      ),
      maxPrice: Number(
        searchParams.get("maxPrice") ?? DEFAULT_FILTERS.maxPrice,
      ),
      rating: Number(searchParams.get("rating") ?? DEFAULT_FILTERS.rating),
      sort: searchParams.get("sort") ?? DEFAULT_FILTERS.sort,
      showUnavailable: searchParams.get("showUnavailable") === "true",
      sellingMode: searchParams.get("sellingMode") ?? DEFAULT_FILTERS.sellingMode,
      group: searchParams.get("group") ?? DEFAULT_FILTERS.group,
    }),
    [searchParams],
  );

  const [allGroups, setAllGroups] = useState([]);
  const [groupFarmerIds, setGroupFarmerIds] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    getGroups()
      .then((list) => {
        if (!cancelled && Array.isArray(list)) {
          setAllGroups(list);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!filters.group || String(filters.group).trim() === "") {
      setGroupFarmerIds(new Set());
      return;
    }

    async function fetchGroupMembers() {
      try {
        const groupsList = allGroups.length > 0 ? allGroups : await getGroups();
        const target = String(filters.group).trim().toLowerCase();
        const found = groupsList.find(
          (g) =>
            String(g.name || "").trim().toLowerCase() === target ||
            String(g.id || "") === String(filters.group),
        );
        if (found?.id) {
          const members = await getGroupMembers(found.id);
          if (!cancelled && Array.isArray(members)) {
            const ids = new Set(members.map((m) => m.userId).filter(Boolean));
            setGroupFarmerIds(ids);
          }
        }
      } catch (err) {
        console.warn("[useMarketplace] fetchGroupMembers error:", err);
      }
    }

    fetchGroupMembers();

    return () => {
      cancelled = true;
    };
  }, [filters.group, allGroups]);

  // Auto-tick every second so expired listings disappear immediately without refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const userLocationRef = useRef(userLocation);
  userLocationRef.current = userLocation;
  const groupFarmerIdsRef = useRef(groupFarmerIds);
  groupFarmerIdsRef.current = groupFarmerIds;
  const allGroupsRef = useRef(allGroups);
  allGroupsRef.current = allGroups;

  // Build the backend filter key. This is a stable string that changes
  // only when the server-relevant filters change (category, sellingMode, showUnavailable).
  const backendFilterKey = useMemo(
    () => `${filters.category}|${filters.sellingMode}|${filters.showUnavailable}`,
    [filters.category, filters.sellingMode, filters.showUnavailable],
  );

  const loadProducts = useCallback(async ({ reset = false } = {}) => {
    try {
      setError(null);

      if (reset) {
        setLoading(true);
        cursorRef.current = null;
      } else {
        if (loadingMoreRef.current) return;
        setLoadingMore(true);
        loadingMoreRef.current = true;
      }

      const activeFilters = filtersRef.current;
      const activeLocation = userLocationRef.current;
      const activeGroupFarmerIds = groupFarmerIdsRef.current;
      const activeAllGroups = allGroupsRef.current;

      // Build backend-supported filter params.
      const apiFilters = {};
      if (activeFilters.category && activeFilters.category !== "All") {
        apiFilters.category = activeFilters.category;
      }
      if (activeFilters.sellingMode && activeFilters.sellingMode !== "all") {
        apiFilters.sellingMode = activeFilters.sellingMode;
      }
      if (!activeFilters.showUnavailable) {
        apiFilters.available = true;
      }

      if (reset) {
        // Reset: fetch fresh data from the beginning.
        let allProducts = [];
        let cursor = null;
        let backendHasMore = true;
        let fetchCount = 0;
        const maxFetches = 5; // safety limit to avoid unbounded loops

        while (fetchCount < maxFetches) {
          const result = await apiGetMarketplaceProducts({
            limit: BACKEND_PAGE_SIZE,
            cursor,
            ...apiFilters,
          });

          const enriched = await enrichProductsWithFarmerGroups(result.products);
          allProducts = [...allProducts, ...enriched];
          cursor = result.cursor;
          backendHasMore = result.hasMore;
          fetchCount++;

          const withDistance = allProducts.map((product) => {
            const lat = product.farmer?.location?.lat;
            const lng = product.farmer?.location?.lng;
            if (!activeLocation || lat == null || lng == null) {
              return { ...product, distance: null };
            }
            return {
              ...product,
              distance: getDistanceKm(activeLocation.lat, activeLocation.lng, lat, lng),
            };
          });
          const filtered = applyClientFilters(
            withDistance,
            activeFilters,
            activeLocation,
            activeGroupFarmerIds,
            activeAllGroups,
          );
          if (filtered.length >= PRODUCTS_PER_PAGE || !backendHasMore) break;
        }

        // Compute distances for the final set.
        const final = allProducts.map((product) => {
          const lat = product.farmer?.location?.lat;
          const lng = product.farmer?.location?.lng;
          if (!activeLocation || lat == null || lng == null) {
            return { ...product, distance: null };
          }
          return {
            ...product,
            distance: getDistanceKm(activeLocation.lat, activeLocation.lng, lat, lng),
          };
        });

        setProducts(final);
        cursorRef.current = cursor;
        setHasMore(backendHasMore);
        pageCache.set(CACHE_KEY, final, CACHE_TTL);
      } else {
        // Append: fetch the next backend page and add new products.
        const result = await apiGetMarketplaceProducts({
          limit: BACKEND_PAGE_SIZE,
          cursor: cursorRef.current,
          ...apiFilters,
        });

        if (result.products.length > 0) {
          const enriched = await enrichProductsWithFarmerGroups(result.products);
          setProducts((current) => {
            const existingIds = new Set(current.map((p) => p.id));
            const newProducts = enriched.filter((p) => !existingIds.has(p.id));
            return newProducts.length > 0 ? [...current, ...newProducts] : current;
          });
        }

        cursorRef.current = result.cursor;
        setHasMore(result.hasMore && result.products.length > 0);
      }
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, []);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.category !== DEFAULT_FILTERS.category ||
    filters.minPrice > 0 ||
    filters.maxPrice > 0 ||
    filters.rating > 0 ||
    filters.showUnavailable ||
    filters.sellingMode !== "all" ||
    filters.group !== "";

  // Re-fetch only when server-side filters change or on initial mount.
  useEffect(() => {
    loadProducts({ reset: true });
  }, [loadProducts, backendFilterKey]);

  const marketplaceProducts = useMemo(
    () =>
      products.map((product) => {
        const lat = product.farmer?.location?.lat;
        const lng = product.farmer?.location?.lng;

        if (!userLocation || lat == null || lng == null) {
          return { ...product, distance: null };
        }

        return {
          ...product,
          distance: getDistanceKm(userLocation.lat, userLocation.lng, lat, lng),
        };
      }),
    [products, userLocation],
  );

  const filteredProducts = useMemo(() => {
    let data = applyClientFilters(
      marketplaceProducts,
      filters,
      userLocation,
      groupFarmerIds,
      allGroups,
    );

    switch (filters.sort) {
      case "price-low":
        data.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        data.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        data.sort((a, b) => (b.productRating ?? 0) - (a.productRating ?? 0));
        break;
      case "relevant":
        data = data
          .map((product) => ({
            ...product,
            relevanceScore: scoreRelevance(product, now),
          }))
          .sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
      default:
        data.sort(
          (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
        );
    }

    return data;
  }, [marketplaceProducts, filters, userLocation, now, groupFarmerIds, allGroups]);

  // ── Discovery sections ─────────────────────────────────────────
  // These are computed from marketplaceProducts (unfiltered) and are
  // only displayed when no search/filter is active.

  const nearbyProducts = useMemo(() => {
    if (!userLocation) return [];

    return marketplaceProducts
      .filter((product) => {
        const distance = Number(product.distance);
        return (
          Number.isFinite(distance) &&
          distance <= DISCOVERY_NEARBY_RADIUS_KM &&
          // Canonical eligibility: excludes expired listings, ended/full
          // pre-orders, unavailable and out-of-stock products — while
          // including open pre-orders even when their future stock is 0.
          // Explicit `now` keeps the section current as deadlines pass.
          getProductInquiryState(product, now).allowed
        );
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, DISCOVERY_SECTION_SIZE);
  }, [marketplaceProducts, userLocation, now]);

  const recentProducts = useMemo(() => {
    return [...marketplaceProducts]
      .filter((product) => product?.createdAt)
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      .slice(0, DISCOVERY_SECTION_SIZE);
  }, [marketplaceProducts]);

  const relevantProducts = useMemo(() => {
    return [...marketplaceProducts]
      .map((product) => ({
        ...product,
        relevanceScore: scoreRelevance(product, now),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, DISCOVERY_RECOMMENDED_SIZE);
  }, [marketplaceProducts, now]);

  function updateFilter(key, value) {
    const params = new URLSearchParams(searchParams);
    const defaultValue = DEFAULT_FILTERS[key];

    if (key === "distance") {
      localStorage.setItem("agri_consumer_distance", String(value));
    }

    if (key === "search") {
      value ? params.set(key, value) : params.delete(key);
    } else if (key === "showUnavailable") {
      value ? params.set(key, "true") : params.delete(key);
    } else if (key === "sellingMode") {
      value && value !== "all" ? params.set(key, value) : params.delete(key);
    } else if (key === "group") {
      value ? params.set(key, value) : params.delete(key);
    } else if (key === "rating" || key === "minPrice" || key === "maxPrice") {
      Number(value) > 0 ? params.set(key, value) : params.delete(key);
    } else if (value !== defaultValue && Number(value) !== defaultValue) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page");
    setSearchParams(params);
  }

  return {
    loading,
    loadingMore,
    error,
    products: marketplaceProducts,
    filteredProducts,
    totalProducts: filteredProducts.length,
    filters,
    hasActiveFilters,
    updateFilter,
    resetFilters: () => {
      localStorage.removeItem("agri_consumer_distance");
      setSearchParams({});
    },
    userLocation,
    showFilters,
    setShowFilters,
    hasMore,
    loadMore: () => loadProducts(),
    reloadProducts: () => loadProducts({ reset: true }),

    // Discovery sections (for default/discovery state)
    nearbyProducts,
    recentProducts,
    relevantProducts,
  };
}
