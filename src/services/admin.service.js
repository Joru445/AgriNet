import * as pageCache from "../utils/pageCache";
import { apiRequest } from "./api/api.client";

/*
 * ============================================================
 * USER MANAGEMENT
 * ============================================================
 */

export async function apiSetUserSuspension(uid, status, options = {}) {
  const body = { status };

  if (status === "suspended") {
    if (options.durationPreset) body.durationPreset = options.durationPreset;
    if (options.duration !== undefined) body.duration = options.duration;
    if (options.reason) body.reason = options.reason;
  }

  const result = await apiRequest(`/admin/users/${uid}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  pageCache.invalidate("adminDashboard");

  return result.user;
}

export async function apiSetProductAvailability(productId, available) {
  const result = await apiRequest(`/admin/products/${productId}/availability`, {
    method: "PATCH",
    body: JSON.stringify({ available }),
  });

  pageCache.invalidate("adminDashboard");

  return result.product;
}

/*
 * ============================================================
 * PRODUCT MANAGEMENT (ADMIN)
 * ============================================================
 */

export async function apiGetAdminProducts(params = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.sellingMode) query.set("sellingMode", params.sellingMode);
  if (params.available) query.set("available", params.available);
  if (params.reported) query.set("reported", params.reported);
  if (params.farmerId) query.set("farmerId", params.farmerId);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const qs = query.toString();
  const result = await apiRequest(`/admin/products${qs ? `?${qs}` : ""}`);

  return {
    products: result.data || [],
    pagination: result.pagination || { total: 0, page: 1, limit: 24, totalPages: 0, hasMore: false },
  };
}

export async function apiGetAdminProduct(productId) {
  const result = await apiRequest(`/admin/products/${productId}`);
  return result.data;
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

/*
 * ============================================================
 * DASHBOARD ANALYTICS (Phase 3B)
 * ============================================================
 */

function withRange(path, { from, to }) {
  const params = new URLSearchParams({ from, to });
  return `${path}?${params.toString()}`;
}

export async function apiGetUserGrowth({ from, to }) {
  const result = await apiRequest(
    withRange("/admin/dashboard/user-growth", { from, to }),
  );
  return result.data;
}

export async function apiGetProductAnalytics({ from, to }) {
  const result = await apiRequest(
    withRange("/admin/dashboard/product-analytics", { from, to }),
  );
  return result.data;
}

export async function apiGetTransactionAnalytics({ from, to }) {
  const result = await apiRequest(
    withRange("/admin/dashboard/transaction-analytics", { from, to }),
  );
  return result.data;
}

export async function apiGetCategoryDistribution() {
  const result = await apiRequest("/admin/dashboard/category-distribution");
  return result.data;
}

/*
 * ============================================================
 * TRANSACTION MANAGEMENT (ADMIN)
 * ============================================================
 */

export async function apiGetAdminTransactions(params = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.type) query.set("type", params.type);
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const qs = query.toString();
  const result = await apiRequest(`/admin/transactions${qs ? `?${qs}` : ""}`);

  return {
    inquiries: result.data || [],
    pagination: result.pagination || { total: 0, page: 1, limit: 24, totalPages: 0, hasMore: false },
  };
}

export async function apiGetAdminTransaction(inquiryId) {
  const result = await apiRequest(`/admin/transactions/${inquiryId}`);
  return result.data;
}

export async function apiGetTransactionSummary() {
  const result = await apiRequest("/admin/transactions/summary");
  return result.data;
}

/*
 * ============================================================
 * AUDIT LOG (ADMIN)
 * ============================================================
 */

export async function apiGetAuditLogs(params = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.action) query.set("action", params.action);
  if (params.targetType) query.set("targetType", params.targetType);
  if (params.adminId) query.set("adminId", params.adminId);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);

  const qs = query.toString();
  const result = await apiRequest(`/admin/audit${qs ? `?${qs}` : ""}`);

  return {
    logs: result.data || [],
    pagination: result.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 },
  };
}
