const STORAGE_KEY = "agrinet_accepted_inquiries";

export function saveAcceptedInquiry(inquiry) {
  if (!inquiry || !inquiry.id) return;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const existingIndex = list.findIndex(
      (item) => item.id === inquiry.id || (inquiry.inquiryMessageId && item.inquiryMessageId === inquiry.inquiryMessageId),
    );
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...inquiry };
    } else {
      list.unshift(inquiry);
    }
    const trimmed = list.slice(0, 40);
    const json = JSON.stringify(trimmed);
    sessionStorage.setItem(STORAGE_KEY, json);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.warn("Could not save accepted inquiry:", e);
  }
}

export function getAcceptedInquiries(uid) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    if (!uid) return list;
    return list.filter((item) => item.farmerId === uid || item.consumerId === uid);
  } catch {
    return [];
  }
}

export function removeAcceptedInquiry(inquiryId) {
  if (!inquiryId) return;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return;
    const updated = list.filter((item) => item.id !== inquiryId && item.inquiryMessageId !== inquiryId);
    const json = JSON.stringify(updated);
    sessionStorage.setItem(STORAGE_KEY, json);
    localStorage.setItem(STORAGE_KEY, json);
  } catch {
    // Ignore storage errors
  }
}
