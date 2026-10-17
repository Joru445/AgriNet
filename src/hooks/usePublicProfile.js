import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { getPublicProfile, getPublicProfileByUsername } from "../services/user.service";
import { getPublicFarmerProductsPage } from "../services/product.service";
import { enrichFarmerReviews, getFarmerReviews } from "../services/farmer-review.service";
import { getProductReviewSummaries } from "../services/product-review.service";
import * as pageCache from "../utils/pageCache";

const CACHE_TTL = 3 * 60 * 1000;

function profileError(error) {
  if (error?.status === 404) return { kind: "not-found", error };
  if (error?.status === 401 || error?.status === 403) return { kind: "unavailable", error };
  return { kind: "network", error };
}

/**
 * Loads only the public-safe profile projection first.  Farmer-only sections
 * are intentionally independent: a failed products or reviews request must
 * never make a valid consumer, admin, or farmer profile appear missing.
 */
export default function usePublicProfile() {
  const { uid, username } = useParams();
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const requestRef = useRef(0);

  const loadProfile = useCallback(async () => {
    const requestId = ++requestRef.current;
    const routeKey = username
      ? `publicProfile:username:${username.toLowerCase()}`
      : `publicProfile:uid:${uid}`;
    if (!uid && !username) {
      setLoading(false);
      return;
    }

    const applyProjection = (projection) => {
      if (requestRef.current !== requestId) return false;
      setProfile(projection.profile);
      setStats(projection.stats ?? null);
      setProducts(projection.products ?? []);
      setReviews(projection.reviews ?? []);
      setError(null);
      setLoading(false);
      return true;
    };

    const cachedRoute = pageCache.get(routeKey);
    if (cachedRoute && applyProjection(cachedRoute)) return;

    setLoading(true);
    setError(null);
    setProducts([]);
    setReviews([]);
    setLoadingProducts(false);
    setLoadingReviews(false);

    try {
      const baseCached = username
        ? pageCache.get(`${routeKey}:base`)
        : null;
      const payload = baseCached || (username
        ? await getPublicProfileByUsername(username)
        : await getPublicProfile(uid));
      if (!payload?.profile) throw Object.assign(new Error("Profile not found."), { status: 404 });

      const projection = { profile: payload.profile, stats: payload.stats ?? null, products: [], reviews: [] };
      if (!applyProjection(projection)) return;

      if (payload.profile.role !== "farmer") {
        pageCache.set(`publicProfile:uid:${payload.profile.uid}`, projection, CACHE_TTL);
        pageCache.set(routeKey, projection, CACHE_TTL);
        return;
      }
      setLoadingProducts(true);
      setLoadingReviews(true);

      const [productResult, reviewResult] = await Promise.allSettled([
        getPublicFarmerProductsPage(payload.profile.uid),
        getFarmerReviews(payload.profile.uid),
      ]);
      if (requestRef.current !== requestId) return;

      const loadedProducts = productResult.status === "fulfilled" ? productResult.value.products : [];
      const loadedReviews = reviewResult.status === "fulfilled" ? reviewResult.value : [];
      const summaries = await getProductReviewSummaries(loadedProducts.map((item) => item.id)).catch(() => new Map());
      if (requestRef.current !== requestId) return;

      const productsWithRatings = loadedProducts.map((item) => ({
        ...item,
        productRating: summaries.get(item.id)?.average ?? item.ratingSummary?.average ?? 0,
        reviewCount: summaries.get(item.id)?.count ?? item.ratingSummary?.count ?? 0,
      }));
      const cached = { profile: payload.profile, stats: payload.stats ?? null, products: productsWithRatings, reviews: loadedReviews };
      pageCache.set(`publicProfile:uid:${payload.profile.uid}`, cached, CACHE_TTL);
      pageCache.set(routeKey, cached, CACHE_TTL);
      setProducts(productsWithRatings);
      setReviews(loadedReviews);
      setLoadingProducts(false);
      setLoadingReviews(false);
      enrichFarmerReviews(loadedReviews)
        .then((enriched) => {
          if (requestRef.current === requestId) setReviews(enriched);
        })
        .catch(() => {});
    } catch (loadError) {
      if (requestRef.current !== requestId) return;
      setProfile(null);
      setStats(null);
      setProducts([]);
      setReviews([]);
      setError(profileError(loadError));
      setLoading(false);
    }
  }, [uid, username]);

  useEffect(() => {
    loadProfile();
    return () => { requestRef.current += 1; };
  }, [loadProfile]);

  return {
    loading,
    loadingProducts,
    loadingReviews,
    profile,
    role: profile?.role ?? null,
    products,
    reviews,
    stats,
    error,
    reload: loadProfile,
    averageRating: stats?.reputation?.averageRating ?? null,
    reviewCount: stats?.reputation?.reviewCount ?? 0,
  };
}
