import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import { getFarmerProducts } from "../services/product.service";
import { getRecentFarmerReviews } from "../services/farmer-review.service";
import { subscribeUserConversations } from "../services/conversation.service";

import { showToast } from "../utils/toast";
import * as pageCache from "../utils/pageCache";

const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export default function useDashboard() {
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalProducts: 0,
    averageRating: 0,
    reviewCount: 0,
    unreadMessages: 0,
    activeInquiries: 0,
  });

  const [recentProducts, setRecentProducts] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);

  const loadDashboard = useCallback(async () => {
    if (!profile?.uid) return;

    // Check cache first
    const cacheKey = `farmerDashboard:${profile.uid}`;
    const cached = pageCache.get(cacheKey);
    if (cached) {
      setStats(cached.stats);
      setRecentProducts(cached.recentProducts);
      setRecentReviews(cached.recentReviews);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [products, reviews] = await Promise.all([
        getFarmerProducts(profile.uid),
        getRecentFarmerReviews(profile.uid, 3),
      ]);

      const averageRating =
        Number(profile?.rating) ||
        (reviews.length === 0
          ? 0
          : Number(
              (
                reviews.reduce(
                  (sum, review) => sum + Number(review.rating || 0),
                  0,
                ) / reviews.length
              ).toFixed(1),
            ));

      const reviewCount = Number(profile?.reviewCount ?? reviews.length);

      setRecentProducts(products.slice(0, 4));
      setRecentReviews(reviews);

      setStats((prev) => ({
        ...prev,
        totalProducts: products.length,
        reviewCount,
        averageRating,
      }));

      // Cache the data
      pageCache.set(cacheKey, {
        stats: {
          totalProducts: products.length,
          reviewCount,
          averageRating,
        },
        recentProducts: products.slice(0, 4),
        recentReviews: reviews,
      }, CACHE_TTL);
    } catch (error) {
      console.error(error);
      showToast.error("Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [profile?.uid, profile?.rating, profile?.reviewCount]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!profile?.uid) return;

    const unsubscribe = subscribeUserConversations(
      profile.uid,
      (conversations) => {
        setRecentConversations(conversations.slice(0, 5));

        const unreadMessages = conversations.reduce(
          (total, conversation) =>
            total + (conversation.unreadCount?.[profile.uid] ?? 0),
          0,
        );

        setStats((prev) => ({
          ...prev,
          unreadMessages,
        }));
      },
    );

    return unsubscribe;
  }, [profile?.uid]);

  return {
    loading,

    stats,

    recentProducts,
    recentReviews,
    recentConversations,

    reloadDashboard: () => {
      if (profile?.uid) {
        pageCache.invalidate(`farmerDashboard:${profile.uid}`);
      }
      loadDashboard();
    },
  };
}
