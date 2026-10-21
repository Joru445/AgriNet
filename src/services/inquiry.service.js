import { apiRequest } from "./api/api.client";
import { subscribeToRealtime } from "./api/realtime.client";

export function subscribeUserInquiries(uid, role, callback, onError) {
  if (!uid || !role || !callback) return () => {};
  return subscribeToRealtime(`/v1/inquiries/stream?role=${encodeURIComponent(role)}`, callback, (error) => {
    console.error("Inquiry subscription failed", error); onError?.(error);
  });
}

export async function getInquiry(inquiryId) {
  if (!inquiryId || typeof inquiryId !== "string") throw new Error("Invalid inquiry ID");
  return apiGetInquiryById(inquiryId);
}

export function mapInquiryToGroup(inquiry) {
  if (!inquiry) return "requests";
  if (inquiry.group && ["requests", "confirmed", "preparation", "in-progress", "completed", "cancelled"].includes(inquiry.group)) {
    return inquiry.group;
  }
  const rawStatus = inquiry.status || inquiry.inquiryStatus || "";
  const status = String(rawStatus).toLowerCase().trim();
  if (status === "pending") return "requests";
  if (["accepted", "reserved", "awaiting_agreement", "confirmed"].includes(status)) return "confirmed";
  if (["preparing", "ready"].includes(status)) return "preparation";
  if (["ongoing", "awaiting_proof", "proof_submitted"].includes(status)) return "in-progress";
  if (["completed", "resolved"].includes(status)) return "completed";
  if (["cancelled", "rejected"].includes(status)) return "cancelled";
  return "requests";
}

function extractInquiryItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data?.inquiries)) return data.data.inquiries;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.inquiries)) return data.inquiries;
  return [];
}

export async function apiGetInquiries({ cursor, limit: pageSize, group, role } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (pageSize) params.set("limit", String(pageSize));
  if (group && group !== "all") params.set("group", group);
  if (role) params.set("role", role);
  const url = `/v1/inquiries${params.size ? `?${params}` : ""}`;
  const data = await apiRequest(url);
  let items = extractInquiryItems(data);

  // If the group query returned 0 items but a specific group was requested,
  // fallback to querying without the group parameter and filtering client-side.
  if (items.length === 0 && group && group !== "all" && !cursor) {
    try {
      const fallbackParams = new URLSearchParams();
      fallbackParams.set("limit", String(Math.max(pageSize || 12, 50)));
      if (role) fallbackParams.set("role", role);
      const fallbackData = await apiRequest(`/v1/inquiries?${fallbackParams}`);
      const rawAll = extractInquiryItems(fallbackData);
      if (rawAll.length > 0) {
        items = rawAll.filter((inq) => mapInquiryToGroup(inq) === group);
      }
    } catch (fallbackError) {
      console.warn("Fallback general inquiry fetch failed:", fallbackError);
    }
  }

  return {
    items,
    cursor: data?.pagination?.cursor ?? null,
    hasMore: Boolean(data?.pagination?.hasMore),
    group: data?.pagination?.group ?? group ?? "all",
  };
}

export async function apiGetInquiryGroupCounts({ role } = {}) {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  const url = `/v1/inquiries/group-counts${params.size ? `?${params}` : ""}`;
  const data = await apiRequest(url);
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
