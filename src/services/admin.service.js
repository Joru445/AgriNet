import * as pageCache from "../utils/pageCache";
import { apiRequest } from "./api/api.client";

/*
 * ============================================================
 * USER MANAGEMENT
 * ============================================================
 */

export async function apiSetUserSuspension(uid, status) {
  const result = await apiRequest(`/admin/users/${uid}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  pageCache.invalidate("adminDashboard");

  return result.user;
}

export async function apiSetProductAvailability(productId, available) {
  const result = await apiRequest(`/admin/products/${productId}/availability`, {
    method: "PATCH",
    body: JSON.stringify({ available }),
  });

  return result.product;
}

/*
 * ============================================================
 * DASHBOARD (via backend API)
 * ============================================================
 */

export async function getDashboardData() {
  const result = await apiRequest("/admin/dashboard");
  return result.data;
}

export async function getDashboardStats() {
  const data = await getDashboardData();
  return data.stats;
}

export async function getRecentUsers() {
  const data = await getDashboardData();
  return data.recentUsers;
}

export async function getRecentProducts() {
  const data = await getDashboardData();
  return data.recentProducts;
}

export async function getRecentInquiries() {
  const data = await getDashboardData();
  return data.recentInquiries;
}
