import { useCallback, useEffect, useState } from "react";

import {
  getDashboardStats,
  getRecentInquiries,
  getRecentProducts,
  getRecentUsers,
} from "../services/admin.service";

const initialStats = {
  users: {
    total: 0,
    farmers: 0,
    consumers: 0,
  },

  products: {
    total: 0,
    available: 0,
    unavailable: 0,
  },

  inquiries: {
    total: 0,
    accepted: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
  },
};

export default function useAdminDashboard() {
  const [stats, setStats] = useState(initialStats);

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashboardStats, users, products, inquiries] = await Promise.all([
        getDashboardStats(),
        getRecentUsers(),
        getRecentProducts(),
        getRecentInquiries(),
      ]);

      setStats(dashboardStats);
      setRecentUsers(users);
      setRecentProducts(products);
      setRecentInquiries(inquiries);
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
    refresh: loadDashboard,
  };
}
