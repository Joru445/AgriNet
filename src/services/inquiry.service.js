import { apiRequest } from "./api/api.client";
import { subscribeToRealtime } from "./api/realtime.client";

export function subscribeUserInquiries(uid, role, callback, onError) {
  if (!uid || !role || !callback) return () => {};
  return subscribeToRealtime(`/v1/inquiries/stream?scope=actions&role=${encodeURIComponent(role)}`, callback, (error) => {
    console.error("Inquiry subscription failed", error); onError?.(error);
  });
}

export async function getInquiry(inquiryId) {
  if (!inquiryId || typeof inquiryId !== "string") throw new Error("Invalid inquiry ID");
  return apiGetInquiryById(inquiryId);
}

export async function apiGetInquiries({ cursor, limit: pageSize, group } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (pageSize) params.set("limit", String(pageSize));
  if (group && group !== "all") params.set("group", group);
  const url = `/v1/inquiries${params.size ? `?${params}` : ""}`;
  const data = await apiRequest(url);
  return {
    items: data.data ?? [],
    cursor: data.pagination?.cursor ?? null,
    hasMore: Boolean(data.pagination?.hasMore),
    group: data.pagination?.group ?? group ?? "all",
  };
}

export async function apiGetInquiryGroupCounts() {
  const data = await apiRequest("/v1/inquiries/group-counts");
  return data.data || {};
}
export async function apiGetInquiryById(inquiryId) {
  const data = await apiRequest(`/v1/inquiries/${encodeURIComponent(inquiryId)}`);
  return data.data ?? null;
}
export async function apiAcceptInquiry(inquiryData) {
  const data = await apiRequest("/v1/inquiries/accept", { method: "POST", body: JSON.stringify(inquiryData) });
  return data.data?.id ?? null;
}
export async function apiStartTransaction(inquiryId) {
  const data = await apiRequest(`/v1/inquiries/${encodeURIComponent(inquiryId)}/start`, { method: "PATCH" });
  return data.data ?? null;
}
export async function apiRequestCompletion(inquiryId) {
  const data = await apiRequest(`/v1/inquiries/${encodeURIComponent(inquiryId)}/request-completion`, { method: "PATCH" });
  return data.data ?? null;
}
export async function apiSubmitProof(inquiryId, proof) {
  const data = await apiRequest(`/v1/inquiries/${encodeURIComponent(inquiryId)}/proof`, { method: "POST", body: JSON.stringify({ proof }) });
  return data.data ?? null;
}
export async function apiConfirmProof(inquiryId) {
  const data = await apiRequest(`/v1/inquiries/${encodeURIComponent(inquiryId)}/confirm-completion`, { method: "PATCH" });
  return data.data ?? null;
}
export async function apiRejectProof(inquiryId) {
  const data = await apiRequest(`/v1/inquiries/${encodeURIComponent(inquiryId)}/reject-proof`, { method: "PATCH" });
  return data.data ?? null;
}
export async function apiCancelInquiry(inquiryId) {
  const data = await apiRequest(`/v1/inquiries/${encodeURIComponent(inquiryId)}/cancel`, { method: "PATCH" });
  return data.data ?? null;
}
export async function apiAcceptPreorderAgreement(inquiryId) {
  const data = await apiRequest(`/v1/inquiries/${encodeURIComponent(inquiryId)}/accept-agreement`, { method: "PATCH" });
  return data.data ?? null;
}
export async function apiAdvancePreorder(inquiryId, state) {
  if (!["preparing", "ready"].includes(state)) throw new Error("Invalid preparation status");
  const data = await apiRequest(`/v1/inquiries/${encodeURIComponent(inquiryId)}/preparation/${state}`, { method: "PATCH" });
  return data.data ?? null;
}
