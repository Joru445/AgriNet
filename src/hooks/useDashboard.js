import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { useConversationsContext } from "../context/ConversationsContext";

import { getFarmerDashboard } from "../services/farmer.service";

import { showToast } from "../utils/toast";
import * as pageCache from "../utils/pageCache";

const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

const initialStats = {
  totalProducts: 0,
  availableProducts: 0,
  unavailableProducts: 0,
  preorderCount: 0,
  averageRating: 0,
  reviewCount: 0,
  unreadMessages: 0,
  totalInquiries: 0,
  pendingInquiries: 0,
  acceptedInquiries: 0,
  reservedInquiries: 0,
  ongoingInquiries: 0,
  completedInquiries: 0,
  cancelledInquiries: 0,
};

export default function useDashboard() {
  const { profile } = useAuth();
  const { conversations } = useConversationsContext();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState(initialStats);

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

      // Dashboard statistics are aggregated server-side (GET /farmers/dashboard)
      // so the client no longer reads whole collections to compute counts.
      const data = await getFarmerDashboard();
      const summary = data?.summary ?? {};

      const apiStats = {
        totalProducts: summary.products?.total ?? 0,
        availableProducts: summary.products?.available ?? 0,
        unavailableProducts: summary.products?.unavailable ?? 0,
        preorderCount: summary.products?.preorder ?? 0,
        averageRating: summary.reviews?.average ?? 0,
        reviewCount: summary.reviews?.count ?? 0,
        unreadMessages: summary.unreadMessages ?? 0,
        totalInquiries: summary.inquiries?.total ?? 0,
        pendingInquiries: summary.inquiries?.pending ?? 0,
        acceptedInquiries: summary.inquiries?.accepted ?? 0,
        reservedInquiries: summary.inquiries?.reserved ?? 0,
        ongoingInquiries: summary.inquiries?.ongoing ?? 0,
        completedInquiries: summary.inquiries?.completed ?? 0,
        cancelledInquiries: summary.inquiries?.cancelled ?? 0,
      };

      const apiRecentProducts = data?.recentProducts ?? [];
      const apiRecentReviews = data?.recentReviews ?? [];

      setStats((prev) => ({ ...prev, ...apiStats }));
      setRecentProducts(apiRecentProducts);
      setRecentReviews(apiRecentReviews);

      // Cache the data
      pageCache.set(cacheKey, {
        stats: apiStats,
        recentProducts: apiRecentProducts,
        recentReviews: apiRecentReviews,
      }, CACHE_TTL);
    } catch (error) {
      console.error(error);
      showToast.error("Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [profile?.uid]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Unread message count and recent conversations come live from the existing
  // ConversationsContext subscription (no additional dashboard listener).
  useEffect(() => {
    if (!conversations.length) return;

    setRecentConversations(conversations.slice(0, 5));

    const unreadMessages = conversations.reduce((total, conversation) => {
      const count =
        typeof conversation.unreadCount === "number"
          ? conversation.unreadCount
          : (conversation.unreadCount?.[profile.uid] ??
              conversation.rawUnreadCount?.[profile.uid] ??
              0);
      return total + count;
    }, 0);

    setStats((prev) => ({
      ...prev,
      unreadMessages,
    }));
  }, [conversations, profile?.uid]);

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