import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { useConversationsContext } from "../context/ConversationsContext";

import { getFarmerDashboard } from "../services/farmer.service";
import { apiGetFarmerProducts } from "../services/product.service";

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

      // Re-verify in background to ensure fresh consistency with active products
      apiGetFarmerProducts(profile.uid)
        .then((activeProducts) => {
          if (Array.isArray(activeProducts)) {
            const total = activeProducts.length;
            const available = activeProducts.filter(
              (p) => p.available !== false && p.sellingMode !== "preorder",
            ).length;
            const preorder = activeProducts.filter(
              (p) => p.sellingMode === "preorder",
            ).length;
            const unavailable = activeProducts.filter(
              (p) => p.available === false,
            ).length;

            setStats((prev) => {
              if (
                prev.totalProducts === total &&
                prev.availableProducts === available &&
                prev.preorderCount === preorder &&
                prev.unavailableProducts === unavailable
              ) {
                return prev;
              }
              const updated = {
                ...prev,
                totalProducts: total,
                availableProducts: available,
                preorderCount: preorder,
                unavailableProducts: unavailable,
              };
              pageCache.set(
                cacheKey,
                {
                  stats: updated,
                  recentProducts: activeProducts.slice(0, 5),
                  recentReviews: cached.recentReviews,
                },
                CACHE_TTL,
              );
              return updated;
            });
            setRecentProducts(activeProducts.slice(0, 5));
          }
        })
        .catch(() => {});
      return;
    }

    try {
      setLoading(true);

      // Fetch dashboard summary and authoritative active products in parallel
      const [data, activeProducts] = await Promise.all([
        getFarmerDashboard(profile.uid),
        apiGetFarmerProducts(profile.uid).catch(() => null),
      ]);
      const summary = data?.summary ?? {};

      let totalProducts = summary.products?.total ?? 0;
      let availableProducts = summary.products?.available ?? 0;
      let unavailableProducts = summary.products?.unavailable ?? 0;
      let preorderCount = summary.products?.preorder ?? 0;
      let apiRecentProducts = data?.recentProducts ?? [];

      if (Array.isArray(activeProducts)) {
        totalProducts = activeProducts.length;
        availableProducts = activeProducts.filter(
          (p) => p.available !== false && p.sellingMode !== "preorder",
        ).length;
        preorderCount = activeProducts.filter(
          (p) => p.sellingMode === "preorder",
        ).length;
        unavailableProducts = activeProducts.filter(
          (p) => p.available === false,
        ).length;
        apiRecentProducts = activeProducts.slice(0, 5);
      }

      const apiStats = {
        totalProducts,
        availableProducts,
        unavailableProducts,
        preorderCount,
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

  // Real-time synchronization when products are created, updated, or deleted
  useEffect(() => {
    const handleProductsUpdated = () => {
      if (profile?.uid) {
        pageCache.invalidate(`farmerDashboard:${profile.uid}`);
        loadDashboard();
      }
    };

    window.addEventListener("agrinet:farmer-products-updated", handleProductsUpdated);
    const handleStorage = (e) => {
      if (e.key === "agrinet_farmer_products_sync") {
        handleProductsUpdated();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("agrinet:farmer-products-updated", handleProductsUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, [profile?.uid, loadDashboard]);

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