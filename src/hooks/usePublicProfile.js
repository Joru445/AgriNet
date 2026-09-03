import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "../firebase/firestore";
import { getUserProfile } from "../services/user.service";
import { getFarmerById } from "../services/farmer.service";
import { getFarmerProducts } from "../services/product.service";
import { getFarmerReviews, enrichFarmerReviews } from "../services/farmer-review.service";
import { getProductReviewSummaries } from "../services/product-review.service";
import * as pageCache from "../utils/pageCache";

const CACHE_KEY = (uid) => `publicProfile:${uid}`;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export default function usePublicProfile() {
  const { uid } = useParams();

  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);

  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  // Consumer-only transaction stats
  const [stats, setStats] = useState({
    loading: false,
    completedDeals: 0,
    totalDeals: 0,
  });

  const loadConsumerStats = useCallback(async (targetUid) => {
    try {
      let completed = 0;
      let total = 0;

      // Direct inquiry query fallback
      const inqRef = collection(db, "inquiries");
      const q = query(inqRef, where("consumerId", "==", targetUid));
      const inqSnap = await getDocs(q);
      if (!inqSnap.empty) {
        total = inqSnap.size;
        completed = inqSnap.docs.filter(
          (d) => d.data().status === "completed",
        ).length;
      }

      // Reviews fallback
      if (completed === 0 && total === 0) {
        const revRef = collection(db, "reviews");
        const qRev = query(revRef, where("reviewerId", "==", targetUid));
        const revSnap = await getDocs(qRev);
        if (!revSnap.empty) {
          completed = revSnap.size;
          total = revSnap.size;
        }
      }

      return {
        completedDeals: completed,
        totalDeals: total > 0 ? total : completed,
      };
    } catch (error) {
      console.error("Failed to load consumer stats:", error);
      return { completedDeals: 0, totalDeals: 0 };
    }
  }, []);

  const loadProfile = useCallback(async () => {
    if (!uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check cache first
      const cacheKey = CACHE_KEY(uid);
      const cached = pageCache.get(cacheKey);
      if (cached) {
        setProfile(cached.profile);
        setRole(cached.role);
        setProducts(cached.products);
        setReviews(cached.reviews);
        setReviewCount(cached.reviewCount);
        setAverageRating(cached.averageRating);
        setStats(cached.stats);
        setLoading(false);
        setLoadingProducts(false);
        setLoadingReviews(false);
        return;
      }

      const user = await getUserProfile(uid);
      if (!user) {
        setProfile(null);
        setRole(null);
        setStats({ loading: false, completedDeals: 0, totalDeals: 0 });
        setLoading(false);
        return;
      }

      const detectedRole = user.role || "consumer";

      // Farmers keep extra profile data (storeName, description, coverPhoto,
      // rating, etc.) in the `farmers` collection, so enrich with it.
      let userResult = user;
      if (detectedRole === "farmer") {
        try {
          const farmerData = await getFarmerById(uid);
          if (farmerData) userResult = farmerData;
        } catch {
          /* keep user doc data */
        }
      }

      setProfile(userResult);
      setRole(detectedRole);

      let loadedProducts = [];
      let loadedReviews = [];
      let loadedReviewCount = 0;
      let loadedAverageRating = 0;
      let loadedStats = { loading: false, completedDeals: 0, totalDeals: 0 };

      if (detectedRole === "farmer") {
        setLoadingReviews(true);
        setLoadingProducts(true);

        try {
          const [productsData, reviewsData] = await Promise.all([
            getFarmerProducts(uid),
            getFarmerReviews(uid),
          ]);

          const productIds = productsData.map((p) => p.id);
          const reviewSummaries = await getProductReviewSummaries(productIds);

          loadedProducts = productsData.map((p) => {
            const summary = reviewSummaries.get(p.id);
            return {
              ...p,
              productRating: summary?.average ?? 0,
              reviewCount: summary?.count ?? 0,
            };
          });

          loadedReviews = reviewsData;
          loadedReviewCount = reviewsData.length;
          loadedAverageRating =
            loadedReviewCount > 0
              ? Number(
                  reviewsData.reduce(
                    (sum, r) => sum + Number(r.rating || 0),
                    0,
                  ) / loadedReviewCount
                ).toFixed(1)
              : 0;

          setProducts(loadedProducts);
          setReviews(loadedReviews);
          setReviewCount(Number(loadedReviewCount) || 0);
          setAverageRating(Number(loadedAverageRating) || 0);

          // Enrich reviews in the background
          enrichFarmerReviews(loadedReviews)
            .then((enriched) => setReviews(enriched))
            .catch(() => {
              /* noop */
            });
        } catch (error) {
          console.error("Failed to load public profile data:", error);
        } finally {
          setLoadingProducts(false);
          setLoadingReviews(false);
        }
      } else {
        setLoadingProducts(false);
        setLoadingReviews(false);

        setStats({ loading: true, completedDeals: 0, totalDeals: 0 });
        loadedStats = await loadConsumerStats(uid);
        setStats({ loading: false, ...loadedStats });
      }

      // Cache everything from the freshly loaded local values (not stale state)
      pageCache.set(
        cacheKey,
        {
          profile: userResult,
          role: detectedRole,
          products: loadedProducts,
          reviews: loadedReviews,
          reviewCount: loadedReviewCount,
          averageRating: loadedAverageRating,
          stats: loadedStats,
        },
        CACHE_TTL,
      );
    } catch (error) {
      console.error("Failed to load public profile:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [uid, loadConsumerStats]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    loading,
    loadingProducts,
    loadingReviews,

    profile,
    role,

    products,

    reviews,
    averageRating,
    reviewCount,

    stats,
  };
}