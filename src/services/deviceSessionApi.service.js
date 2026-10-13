import { apiRequest } from "./api/api.client";

export async function listDeviceSessions() {
  const result = await apiRequest("/v1/me/sessions");
  return result.data?.sessions || [];
}

export function revokeDeviceSession(sessionId) {
  return apiRequest(`/v1/me/sessions/${encodeURIComponent(sessionId)}`, { method: "DELETE" });
}

export function logoutOtherDeviceSessions() {
  return apiRequest("/v1/me/sessions/logout-others", { method: "POST" });
}

export function logoutAllDeviceSessions() {
  return apiRequest("/v1/me/sessions/logout-all", { method: "POST" });
}
