import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

import { db } from "../firebase/firestore";
import { getUserProfile } from "../services/user.service";
import { getFarmerById } from "../services/farmer.service";
import { getFarmerProducts } from "../services/product.service";
import { getFarmerReviews, enrichFarmerReviews } from "../services/farmer-review.service";
import { getProductReviewSummaries } from "../services/product-review.service";
import { useAuth } from "../context/AuthContext";
import * as pageCache from "../utils/pageCache";

const CACHE_KEY = (uid) => `publicProfile:${uid}`;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export default function usePublicProfile() {
  const { uid } = useParams();
  const { profile: authProfile } = useAuth();

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

  const loadConsumerStats = useCallback(async (targetUid, userData = null) => {
    try {
      // 1. Direct check on user profile document synced stats
      const userCompleted = Number(
        userData?.completedDeals ??
          userData?.transactionStats?.completedDeals ??
          userData?.dealsCompleted ??
          -1,
      );
      const userTotal = Number(
        userData?.totalDeals ??
          userData?.transactionStats?.totalDeals ??
          userData?.dealsTotal ??
          -1,
      );

      if (userCompleted >= 0 && userTotal >= 0) {
        return {
          completedDeals: userCompleted,
          totalDeals: Math.max(userTotal, userCompleted),
        };
      }

      let completed = userCompleted >= 0 ? userCompleted : 0;
      let total = userTotal >= 0 ? userTotal : 0;

      // 2. Direct inquiry query (works when viewer is the consumer or authorized)
      try {
        const inqRef = collection(db, "inquiries");
        const q = query(inqRef, where("consumerId", "==", targetUid));
        const inqSnap = await getDocs(q);
        if (!inqSnap.empty) {
          const docs = inqSnap.docs.map((d) => d.data());
          const comp = docs.filter(
            (d) => d.status === "completed" || d.status === "resolved",
          ).length;
          const tot = docs.length;
          return {
            completedDeals: comp,
            totalDeals: Math.max(tot, comp),
          };
        }
      } catch {
        // Expected for other users due to inquiry privacy rules
      }

      // 3. Public reviews collection fallback (readable by all users)
      try {
        const revRef = collection(db, "reviews");
        const qRev = query(revRef, where("reviewerId", "==", targetUid));
        const revSnap = await getDocs(qRev);
        if (!revSnap.empty) {
          completed = Math.max(completed, revSnap.size);
          total = Math.max(total, revSnap.size);
        }
      } catch (revErr) {
        console.warn("Reviews fallback error:", revErr);
      }

      // 4. Public product-reviews collection fallback (readable by all users)
      try {
        const prodRevRef = collection(db, "product-reviews");
        const qProdRev = query(prodRevRef, where("reviewerId", "==", targetUid));
        const prodRevSnap = await getDocs(qProdRev);
        if (!prodRevSnap.empty) {
          completed = Math.max(completed, prodRevSnap.size);
          total = Math.max(total, prodRevSnap.size);
        }
      } catch (prodRevErr) {
        console.warn("Product reviews fallback error:", prodRevErr);
      }

      return {
        completedDeals: completed,
        totalDeals: total > 0 ? total : completed,
      };
    } catch (error) {
      console.error("Failed to load consumer stats:", error);
      return {
        completedDeals: Number(userData?.completedDeals || 0),
        totalDeals: Number(userData?.totalDeals || userData?.completedDeals || 0),
      };
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
      if (cached && cached.profile && cached.role) {
        setProfile(cached.profile);
        setRole(cached.role);
        setProducts(cached.products || []);
        setReviews(cached.reviews || []);
        setReviewCount(cached.reviewCount || 0);
        setAverageRating(cached.averageRating || 0);
        setStats(cached.stats || { loading: false, completedDeals: 0, totalDeals: 0 });
        setLoading(false);
        setLoadingProducts(false);
        setLoadingReviews(false);
        return;
      }

      const isOwnProfile = authProfile?.uid === uid;

      // 1. Fetch user doc and farmer doc directly from Firestore in parallel
      const [userSnap, farmerSnap] = await Promise.all([
        getDoc(doc(db, "users", uid)).catch(() => null),
        getDoc(doc(db, "farmers", uid)).catch(() => null),
      ]);

      let user = userSnap?.exists() ? { uid: userSnap.id, ...userSnap.data() } : null;
      let farmerData = farmerSnap?.exists() ? { uid: farmerSnap.id, ...farmerSnap.data() } : null;

      // 2. If neither exists directly, fallback to services
      if (!user && !farmerData) {
        const [fallbackUser, fallbackFarmer] = await Promise.all([
          getUserProfile(uid, authProfile?.uid).catch(() => null),
          getFarmerById(uid).catch(() => null),
        ]);
        user = fallbackUser;
        farmerData = fallbackFarmer;
      }

      if (!user && !farmerData) {
        setProfile(null);
        setRole(null);
        setStats({ loading: false, completedDeals: 0, totalDeals: 0 });
        setLoading(false);
        return;
      }

      // 3. Determine the target user's role:
      // A user is a FARMER if:
      // - farmerData document exists, OR
      // - user.role === "farmer"
      // Otherwise, the user is a CONSUMER.
      const detectedRole =
        farmerData || user?.role === "farmer"
          ? "farmer"
          : (user?.role || (isOwnProfile ? authProfile?.role : null) || "consumer");

      const userResult = {
        ...(user || {}),
        ...(farmerData || {}),
        ...(isOwnProfile && authProfile ? authProfile : {}),
        role: detectedRole,
      };

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
            getFarmerProducts(uid).catch(() => []),
            getFarmerReviews(uid).catch(() => []),
          ]);

          const productIds = productsData.map((p) => p.id);
          const reviewSummaries = await getProductReviewSummaries(productIds).catch(() => new Map());

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
                )
              : Number(farmerData?.rating || user?.rating || 0);

          setProducts(loadedProducts);
          setReviews(loadedReviews);
          setReviewCount(Number(loadedReviewCount) || 0);
          setAverageRating(Number(loadedAverageRating) || 0);

          // Enrich reviews in the background
          enrichFarmerReviews(loadedReviews)
            .then((enriched) => setReviews(enriched))
            .catch(() => {});
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
        loadedStats = await loadConsumerStats(uid, userResult);
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
  }, [uid, loadConsumerStats, authProfile?.uid]);

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