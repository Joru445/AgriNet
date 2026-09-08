import { useCallback, useEffect, useState } from "react";

import { getDashboardData } from "../services/admin.service";
import * as pageCache from "../utils/pageCache";

const CACHE_KEY = "adminDashboard";
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

const initialStats = {
  users: {
    total: 0,
    farmers: 0,
    consumers: 0,
    admins: 0,
    suspended: 0,
    active: 0,
  },

  products: {
    total: 0,
    available: 0,
    unavailable: 0,
    preorder: 0,
  },

  inquiries: {
    total: 0,
    pending: 0,
    accepted: 0,
    reserved: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
  },
};

export default function useAdminDashboard() {
  const [stats, setStats] = useState(() => pageCache.get(CACHE_KEY)?.stats ?? initialStats);

  const [recentUsers, setRecentUsers] = useState(() => pageCache.get(CACHE_KEY)?.recentUsers ?? []);
  const [recentProducts, setRecentProducts] = useState(() => pageCache.get(CACHE_KEY)?.recentProducts ?? []);
  const [recentInquiries, setRecentInquiries] = useState(() => pageCache.get(CACHE_KEY)?.recentInquiries ?? []);

  const [loading, setLoading] = useState(!pageCache.get(CACHE_KEY));
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async ({ useCache = true } = {}) => {
    try {
      const cached = useCache ? pageCache.get(CACHE_KEY) : null;
      if (cached) {
        setStats(cached.stats);
        setRecentUsers(cached.recentUsers);
        setRecentProducts(cached.recentProducts);
        setRecentInquiries(cached.recentInquiries);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const data = await getDashboardData();

      setStats(data.stats);
      setRecentUsers(data.recentUsers);
      setRecentProducts(data.recentProducts);
      setRecentInquiries(data.recentInquiries);

      pageCache.set(CACHE_KEY, {
        stats: data.stats,
        recentUsers: data.recentUsers,
        recentProducts: data.recentProducts,
        recentInquiries: data.recentInquiries,
      }, CACHE_TTL);
    } catch (err) {
      console.error("Failed to load admin dashboard:", err);

      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    stats,
    recentUsers,
    recentProducts,
    recentInquiries,
    loading,
    error,
    refresh: () => loadDashboard({ useCache: false }),
  };
}
