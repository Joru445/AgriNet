const STORAGE_KEY = "agrinet_accepted_inquiries";
const HANDLED_KEY = "agrinet_handled_inquiries";

function normalizeId(id) {
  if (!id) return "";
  return String(id).trim();
}

function matchesInquiryId(item, targetId) {
  if (!item || !targetId) return false;
  const target = normalizeId(targetId);
  const targetRaw = target.replace(/^inq_/, "");
  const itemId = normalizeId(item.id);
  const itemRaw = itemId.replace(/^inq_/, "");
  const msgId = normalizeId(item.inquiryMessageId);
  const inqId = normalizeId(item.inquiryId);

  return (
    itemId === target ||
    itemRaw === target ||
    (Boolean(targetRaw) && itemRaw === targetRaw) ||
    msgId === target ||
    (Boolean(targetRaw) && msgId === targetRaw) ||
    inqId === target ||
    (Boolean(targetRaw) && inqId === targetRaw)
  );
}

function getHandledIds() {
  try {
    const raw = sessionStorage.getItem(HANDLED_KEY) || localStorage.getItem(HANDLED_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function markHandledId(inquiryId) {
  if (!inquiryId) return;
  try {
    const list = getHandledIds();
    const idStr = normalizeId(inquiryId);
    const rawId = idStr.replace(/^inq_/, "");
    if (!list.includes(idStr)) list.push(idStr);
    if (rawId && !list.includes(rawId)) list.push(rawId);
    const trimmed = list.slice(-100);
    const json = JSON.stringify(trimmed);
    sessionStorage.setItem(HANDLED_KEY, json);
    localStorage.setItem(HANDLED_KEY, json);
  } catch {
    // Ignore storage errors
  }
}

export function isHandledInquiry(inquiryId) {
  if (!inquiryId) return false;
  const list = getHandledIds();
  const idStr = normalizeId(inquiryId);
  const rawId = idStr.replace(/^inq_/, "");
  return list.includes(idStr) || (Boolean(rawId) && list.includes(rawId));
}

export function saveAcceptedInquiry(inquiry) {
  if (!inquiry || !inquiry.id) return;
  if (
    isHandledInquiry(inquiry.id) ||
    (inquiry.inquiryMessageId && isHandledInquiry(inquiry.inquiryMessageId))
  ) {
    return;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const existingIndex = list.findIndex(
      (item) =>
        matchesInquiryId(item, inquiry.id) ||
        (inquiry.inquiryMessageId && matchesInquiryId(item, inquiry.inquiryMessageId)),
    );
    const itemToSave = {
      ...inquiry,
      savedAt: inquiry.savedAt || Date.now(),
    };
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...itemToSave };
    } else {
      list.unshift(itemToSave);
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
    const now = Date.now();
    const handled = new Set(getHandledIds());
    // Optimistic accepted inquiries expire after 5 minutes or if marked handled
    const valid = list.filter((item) => {
      const idStr = normalizeId(item.id);
      const rawId = idStr.replace(/^inq_/, "");
      const msgId = normalizeId(item.inquiryMessageId);
      if (
        handled.has(idStr) ||
        (rawId && handled.has(rawId)) ||
        (msgId && handled.has(msgId))
      ) {
        return false;
      }
      if (item.savedAt && now - item.savedAt > 5 * 60 * 1000) {
        return false;
      }
      return true;
    });
    if (valid.length !== list.length) {
      const json = JSON.stringify(valid);
      sessionStorage.setItem(STORAGE_KEY, json);
      localStorage.setItem(STORAGE_KEY, json);
    }
    if (!uid) return valid;
    return valid.filter((item) => item.farmerId === uid || item.consumerId === uid);
  } catch {
    return [];
  }
}

export function removeAcceptedInquiry(inquiryId) {
  if (!inquiryId) return;
  markHandledId(inquiryId);
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return;
    const updated = list.filter((item) => !matchesInquiryId(item, inquiryId));
    const json = JSON.stringify(updated);
    sessionStorage.setItem(STORAGE_KEY, json);
    localStorage.setItem(STORAGE_KEY, json);
  } catch {
    // Ignore storage errors
  }
}
