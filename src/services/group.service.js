// ============================================================
// Groups API Service
// ============================================================
//
// Frontend service for the Groups API with resilient Firestore fallbacks.
// Uses the centralized apiRequest client for all HTTP calls.
// ============================================================

import { apiRequest } from "./api/api.client";
import * as pageCache from "../utils/pageCache";
import { db } from "../firebase/firestore";
import { auth } from "../firebase/auth";
import {
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getUserProfile } from "./user.service";
import { GROUP_PERMISSIONS } from "../constants/groupPermissions";

const GROUPS_BASE = "/v1/groups";
const APPROVED_GROUPS_CACHE_TTL = 2 * 60 * 1000;

function approvedGroupsCacheKey(userId) {
  return `approvedUserGroups:${userId}`;
}

function invalidateApprovedGroupsCache(userId) {
  if (userId) {
    pageCache.invalidate(approvedGroupsCacheKey(userId));
  }
}

// ============================================================
// GROUP CRUD
// ============================================================

/**
 * List all active groups.
 * @returns {Promise<Array>} Array of group objects
 */
export async function getGroups() {
  const cacheKey = "all_groups";
  const cached = pageCache.get(cacheKey);

  // 1. Direct Firestore first for immediate response
  try {
    const snapshot = await getDocs(collection(db, "groups"));
    const list = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((g) => g.active !== false && g.name && String(g.name).trim() !== "");
    
    // Deduplicate by normalized name
    const uniqueMap = new Map();
    for (const g of list) {
      const norm = String(g.name).trim().toLowerCase();
      if (!uniqueMap.has(norm)) {
        uniqueMap.set(norm, { ...g, name: String(g.name).trim() });
      }
    }
    const cleanList = Array.from(uniqueMap.values());
    if (cleanList.length > 0) {
      pageCache.set(cacheKey, cleanList, 5 * 60 * 1000);
      return cleanList;
    }
  } catch (err) {
    console.warn("[group.service] Firestore getDocs failed, trying API:", err);
  }

  // 2. API fallback
  try {
    const data = await apiRequest(`${GROUPS_BASE}?active=true`);
    const rawList = (data?.data ?? []).filter(
      (g) => g.active !== false && g.name && String(g.name).trim() !== "",
    );
    const uniqueMap = new Map();
    for (const g of rawList) {
      const norm = String(g.name).trim().toLowerCase();
      if (!uniqueMap.has(norm)) {
        uniqueMap.set(norm, { ...g, name: String(g.name).trim() });
      }
    }
    const cleanList = Array.from(uniqueMap.values());
    if (cleanList.length > 0) {
      pageCache.set(cacheKey, cleanList, 5 * 60 * 1000);
      return cleanList;
    }
  } catch {}

  return cached || [];
}

/**
 * Get a single group by ID.
 * @param {string} groupId
 * @returns {Promise<Object|null>} Group object or null
 */
export async function getGroup(groupId) {
  if (!groupId) return null;
  const cacheKey = `group_${groupId}`;
  const cached = pageCache.get(cacheKey);

  // 1. Direct Firestore first for lightning fast load
  try {
    const snap = await getDoc(doc(db, "groups", groupId));
    if (snap.exists()) {
      const g = { id: snap.id, ...snap.data() };
      pageCache.set(cacheKey, g, 5 * 60 * 1000);
      return g;
    }
  } catch (err) {
    console.warn("[group.service] Firestore getDoc failed, trying API:", err);
  }

  // 2. API fallback
  try {
    const data = await apiRequest(`${GROUPS_BASE}/${encodeURIComponent(groupId)}`);
    if (data?.data) {
      pageCache.set(cacheKey, data.data, 5 * 60 * 1000);
      return data.data;
    }
  } catch {}

  return cached || null;
}

/**
 * Create a new group (admin only).
 * @param {Object} groupData - { name, description?, imageUrl? }
 * @returns {Promise<Object>} Created group
 */
export async function createGroup(groupData) {
  const data = await apiRequest(GROUPS_BASE, {
    method: "POST",
    body: JSON.stringify(groupData),
  });
  pageCache.invalidate("all_groups");
  return data.data;
}

/**
 * Update a group (admin or manager with group.edit).
 * @param {string} groupId
 * @param {Object} updates - { name?, description?, imageUrl?, active? }
 * @returns {Promise<Object>} Updated group
 */
export async function updateGroup(groupId, updates) {
  const data = await apiRequest(`${GROUPS_BASE}/${encodeURIComponent(groupId)}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  pageCache.invalidate("all_groups");
  pageCache.invalidate(`group_${groupId}`);
  return data.data;
}

/**
 * Delete a group (admin only).
 * @param {string} groupId
 * @returns {Promise<boolean>}
 */
export async function deleteGroup(groupId) {
  await apiRequest(`${GROUPS_BASE}/${encodeURIComponent(groupId)}`, {
    method: "DELETE",
  });
  pageCache.invalidate("all_groups");
  pageCache.invalidate(`group_${groupId}`);
  return true;
}

// ============================================================
// MEMBERSHIP — AUTHENTICATED USER (/me)
// ============================================================

function getRecordTimestamp(item) {
  if (!item) return 0;
  const ts = item.updatedAt || item.appliedAt || item.createdAt || item.joinedAt || item.removedAt || item.rejectedAt;
  if (ts?.toDate && typeof ts.toDate === "function") return ts.toDate().getTime();
  if (typeof ts === "number") return ts;
  if (typeof ts === "string") {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }
  return 0;
}

function toIsoStringSafe(ts) {
  if (!ts) return null;
  if (ts?.toDate && typeof ts.toDate === "function") return ts.toDate().toISOString();
  if (typeof ts === "string") return ts;
  try {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

/**
 * Apply to join a group.
 * Sends payload to backend and syncs with Firestore across all collection schemas.
 * @param {string} groupId
 * @returns {Promise<Object>} Membership object
 */
export async function applyToGroup(groupId) {
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  if (!userId) {
    throw new Error("You must be logged in to apply.");
  }

  const membershipId = `${groupId}_${userId}`;

  // 1. Fetch applicant profile data to enrich the application record
  let applicantData = {};
  try {
    const profile = await getUserProfile(userId);
    if (profile) {
      applicantData = {
        applicantName: profile.fullname || profile.displayName || profile.fullName || profile.username || "Farmer",
        applicantUsername: profile.username || "",
        applicantEmail: profile.email || currentUser.email || "",
        applicantPhone: profile.phone || profile.contactNumber || "",
        applicantLocation: typeof profile.location === "object" ? (profile.location?.address || profile.location?.city || "") : (profile.location || ""),
        applicantAvatar: profile.profilePicture || currentUser.photoURL || "",
        applicantRole: profile.role || "farmer",
        applicantVerified: profile.verificationStatus === "approved" || profile.verified === true,
        applicantBio: profile.bio || "",
      };
    }
  } catch {}

  // 2. Call backend API with groupId and userId in payload
  try {
    await apiRequest(
      `${GROUPS_BASE}/${encodeURIComponent(groupId)}/apply`,
      {
        method: "POST",
        body: JSON.stringify({ groupId, userId }),
      },
    );
  } catch (err) {
    console.warn("[group.service] API applyToGroup:", err);
  }

  // 3. Write to Firestore across all relevant locations
  const nowIso = new Date().toISOString();
  const newDoc = {
    id: membershipId,
    groupId,
    userId,
    status: "pending",
    appliedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    rejectedAt: null,
    removedAt: null,
    ...applicantData,
  };

  // 3A. Write compound document
  try {
    await setDoc(doc(db, "group-memberships", membershipId), newDoc);
  } catch (fsErr) {
    console.warn("[group.service] Compound doc write failed:", fsErr);
  }

  // 3B. Resilient write to auto-ID doc in group-memberships (Rule allows CREATE for active users)
  try {
    const autoRef = doc(collection(db, "group-memberships"));
    await setDoc(autoRef, {
      ...newDoc,
      id: autoRef.id,
      compoundId: membershipId,
      isFreshApplication: true,
    });
  } catch (autoErr) {
    console.warn("[group.service] Auto-id doc write failed:", autoErr);
  }

  // 3C. Write to subcollection groups/{groupId}/applications/{userId} (open to all authenticated users)
  try {
    await setDoc(doc(db, "groups", groupId, "applications", userId), newDoc);
  } catch (subErr) {
    console.warn("[group.service] Subcollection write failed:", subErr);
  }

  // 3D. Write to group_memberships
  try {
    await setDoc(doc(db, "group_memberships", membershipId), newDoc);
  } catch {}

  const clientResult = {
    id: membershipId,
    groupId,
    userId,
    status: "pending",
    appliedAt: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
    rejectedAt: null,
    removedAt: null,
    ...applicantData,
  };

  // 4. Immediately update pageCache for this group's membership and user's membership list
  pageCache.set(`membership_${groupId}_${userId}`, clientResult, 5 * 60 * 1000);

  const cachedMy = pageCache.get(`my_memberships_${userId}`);
  if (Array.isArray(cachedMy)) {
    const updated = cachedMy.filter((m) => m.groupId !== groupId);
    updated.push(clientResult);
    pageCache.set(`my_memberships_${userId}`, updated, 5 * 60 * 1000);
  } else {
    pageCache.set(`my_memberships_${userId}`, [clientResult], 5 * 60 * 1000);
  }

  // 5. Local storage broadcast cache
  try {
    localStorage.setItem(`pending_app_${groupId}_${userId}`, JSON.stringify(clientResult));
  } catch {}

  return clientResult;
}

/**
 * Get the authenticated user's memberships across all groups.
 * Merges API and Firestore data.
 * @returns {Promise<Array>} Array of membership objects
 */
export async function getMyMemberships() {
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;
  if (!userId) return [];

  const map = new Map();

  // 1. Fetch from Firestore group-memberships (realtime canonical store)
  try {
    const q = query(collection(db, "group-memberships"), where("userId", "==", userId));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      const data = d.data();
      const rawGid = data.groupId || (d.id.includes("_") ? d.id.split("_")[0] : null);
      if (!rawGid) continue;
      const key = String(rawGid).trim();

      const existing = map.get(key);
      const newTime = getRecordTimestamp(data);
      const existTime = existing ? getRecordTimestamp(existing) : -1;

      if (!existing || newTime >= existTime) {
        map.set(key, {
          id: `${key}_${userId}`,
          groupId: key,
          userId,
          ...data,
          appliedAt: toIsoStringSafe(data.appliedAt || data.createdAt),
          joinedAt: toIsoStringSafe(data.joinedAt),
          rejectedAt: toIsoStringSafe(data.rejectedAt),
          removedAt: toIsoStringSafe(data.removedAt),
          updatedAt: toIsoStringSafe(data.updatedAt),
        });
      }
    }
  } catch (err) {
    console.warn("[group.service] Firestore getMyMemberships query failed, checking all docs:", err);
    try {
      const snap = await getDocs(collection(db, "group-memberships"));
      for (const d of snap.docs) {
        const data = d.data();
        const docUserId = data.userId || (d.id.includes("_") ? d.id.split("_")[1] : null);
        if (docUserId === userId) {
          const rawGid = data.groupId || (d.id.includes("_") ? d.id.split("_")[0] : null);
          if (!rawGid) continue;
          const key = String(rawGid).trim();
          const existing = map.get(key);
          const newTime = getRecordTimestamp(data);
          const existTime = existing ? getRecordTimestamp(existing) : -1;
          if (!existing || newTime >= existTime) {
            map.set(key, {
              id: `${key}_${userId}`,
              groupId: key,
              userId,
              ...data,
              appliedAt: toIsoStringSafe(data.appliedAt || data.createdAt),
              joinedAt: toIsoStringSafe(data.joinedAt),
              rejectedAt: toIsoStringSafe(data.rejectedAt),
              removedAt: toIsoStringSafe(data.removedAt),
              updatedAt: toIsoStringSafe(data.updatedAt),
            });
          }
        }
      }
    } catch {}
  }

  // 2. Fetch from API fallback
  try {
    const data = await apiRequest(`${GROUPS_BASE}/me/memberships`);
    const apiList = data?.data ?? [];
    if (Array.isArray(apiList)) {
      for (const item of apiList) {
        if (!item.groupId) continue;
        const key = String(item.groupId).trim();
        const existing = map.get(key);
        if (!existing) {
          map.set(key, { ...item, id: item.id || `${key}_${userId}`, groupId: key, userId });
        } else {
          // If existing status is "pending", do NOT let older API "removed" or "rejected" overwrite it!
          const apiTime = getRecordTimestamp(item);
          const existTime = getRecordTimestamp(existing);
          if (apiTime > existTime) {
            if (existing.status === "pending" && (item.status === "removed" || item.status === "rejected")) {
              // Keep pending since user applied freshly
            } else {
              map.set(key, { ...existing, ...item });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("[group.service] API getMyMemberships error:", err);
  }

  // 3. Local storage broadcast cache (for immediate optimistic UI updates)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("pending_app_") && k.endsWith(`_${userId}`)) {
        const item = JSON.parse(localStorage.getItem(k));
        if (item && item.groupId && item.status === "pending") {
          const key = String(item.groupId).trim();
          const existing = map.get(key);
          if (!existing || existing.status === "removed" || existing.status === "rejected") {
            map.set(key, { ...existing, ...item, status: "pending" });
          }
        }
      }
    }
  } catch {}

  // 3B. Cross-check user approved groups so approved status is never missed
  try {
    const cachedApproved = pageCache.get(approvedGroupsCacheKey(userId));
    if (Array.isArray(cachedApproved) && cachedApproved.length > 0) {
      for (const g of cachedApproved) {
        const gId = g.groupId || g.id;
        if (gId) {
          const key = String(gId).trim();
          if (!map.has(key)) {
            map.set(key, {
              id: `${key}_${userId}`,
              groupId: key,
              userId,
              status: "approved",
              groupName: g.groupName || g.name,
              groupImageUrl: g.groupImageUrl || g.imageUrl,
            });
          }
        }
      }
    } else if (map.size === 0) {
      const approvedList = await getUserApprovedGroups(userId);
      if (Array.isArray(approvedList)) {
        for (const g of approvedList) {
          const gId = g.groupId || g.id;
          if (gId) {
            const key = String(gId).trim();
            if (!map.has(key)) {
              map.set(key, {
                id: `${key}_${userId}`,
                groupId: key,
                userId,
                status: "approved",
                groupName: g.groupName || g.name,
                groupImageUrl: g.groupImageUrl || g.imageUrl,
              });
            }
          }
        }
      }
    }
  } catch {}

  const result = Array.from(map.values());
  pageCache.set(`my_memberships_${userId}`, result, 5 * 60 * 1000);
  for (const item of result) {
    if (item.groupId) {
      pageCache.set(`membership_${item.groupId}_${userId}`, item, 5 * 60 * 1000);
    }
  }
  return result;
}

/**
 * Get the authenticated user's membership for a specific group.
 * @param {string} groupId
 * @returns {Promise<Object|null>} Membership object or null
 */
export async function getMyMembership(groupId) {
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  if (!userId || !groupId) return null;

  const membershipId = `${groupId}_${userId}`;

  // 1. Query all docs for this user (sort by newest timestamp so fresh application always wins over old status!)
  try {
    const q = query(collection(db, "group-memberships"), where("userId", "==", userId));
    const snap = await getDocs(q);
    const matches = [];
    for (const d of snap.docs) {
      const data = d.data();
      const rawGid = data.groupId || (d.id.includes("_") ? d.id.split("_")[0] : null);
      if (String(rawGid).trim() === String(groupId).trim()) {
        matches.push({ id: d.id, ...data });
      }
    }

    if (matches.length > 0) {
      matches.sort((a, b) => getRecordTimestamp(b) - getRecordTimestamp(a));
      const chosen = matches[0];
      const status = chosen.status || "pending";

      if (status === "rejected" || status === "removed" || status === "approved") {
        try {
          localStorage.removeItem(`pending_app_${groupId}_${userId}`);
        } catch {}
      }

      const res = {
        id: chosen.id,
        groupId,
        userId,
        ...chosen,
        status,
        appliedAt: toIsoStringSafe(chosen.appliedAt || chosen.createdAt),
        joinedAt: toIsoStringSafe(chosen.joinedAt),
        rejectedAt: toIsoStringSafe(chosen.rejectedAt),
        removedAt: toIsoStringSafe(chosen.removedAt),
        updatedAt: toIsoStringSafe(chosen.updatedAt),
      };

      pageCache.set(`membership_${groupId}_${userId}`, res, 5 * 60 * 1000);
      return res;
    }
  } catch (err) {
    console.warn("[group.service] Query group-memberships by userId failed:", err);
  }

  // 2. Direct Firestore compound doc
  try {
    const snap = await getDoc(doc(db, "group-memberships", membershipId));
    if (snap.exists()) {
      const data = snap.data();
      const status = data.status || "pending";

      const appliedAt = toIsoStringSafe(data.appliedAt || data.createdAt);
      const joinedAt = toIsoStringSafe(data.joinedAt);
      const rejectedAt = toIsoStringSafe(data.rejectedAt);
      const removedAt = toIsoStringSafe(data.removedAt);
      const updatedAt = toIsoStringSafe(data.updatedAt);

      if (status === "rejected" || status === "removed" || status === "approved") {
        try {
          localStorage.removeItem(`pending_app_${groupId}_${userId}`);
        } catch {}
      }

      const res = {
        id: snap.id,
        groupId,
        userId,
        ...data,
        status,
        appliedAt,
        joinedAt,
        rejectedAt,
        removedAt,
        updatedAt,
      };

      pageCache.set(`membership_${groupId}_${userId}`, res, 5 * 60 * 1000);
      return res;
    }
  } catch (err) {
    console.warn("[group.service] Direct Firestore getMyMembership failed:", err);
  }

  // 3. Subcollection groups/{groupId}/applications/{userId}
  try {
    const snap = await getDoc(doc(db, "groups", groupId, "applications", userId));
    if (snap.exists()) {
      const data = snap.data();
      const res = {
        id: membershipId,
        groupId,
        userId,
        ...data,
        status: data.status || "pending",
        appliedAt: toIsoStringSafe(data.appliedAt || data.createdAt),
      };
      pageCache.set(`membership_${groupId}_${userId}`, res, 5 * 60 * 1000);
      return res;
    }
  } catch {}

  // 4. Local storage broadcast cache
  try {
    const cached = localStorage.getItem(`pending_app_${groupId}_${userId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && (parsed.status === "pending" || !parsed.status)) {
        pageCache.set(`membership_${groupId}_${userId}`, parsed, 5 * 60 * 1000);
        return parsed;
      }
    }
  } catch {}

  // 5. Backend API memberships fallback
  try {
    const memberships = await getMyMemberships();
    const found = memberships.find((m) => String(m.groupId).trim() === String(groupId).trim());
    if (found) {
      pageCache.set(`membership_${groupId}_${userId}`, found, 5 * 60 * 1000);
      return found;
    }
  } catch {}

  return null;
}

/**
 * Subscribe to real-time changes to the current user's membership in a group.
 * @param {string} groupId
 * @param {string} userId
 * @param {function} callback
 * @returns {function} Unsubscribe function
 */
export function subscribeToMyMembership(groupId, userId, callback) {
  if (!groupId || !userId || typeof callback !== "function") {
    return () => {};
  }
  const membershipId = `${groupId}_${userId}`;
  const unsubs = [];

  const trigger = async () => {
    try {
      const mem = await getMyMembership(groupId);
      callback(mem);
    } catch (err) {
      console.warn("[group.service] subscribeToMyMembership error:", err);
    }
  };

  // Immediate fetch
  trigger();

  // Listen directly to compound doc
  try {
    unsubs.push(
      onSnapshot(
        doc(db, "group-memberships", membershipId),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const status = data.status || "pending";
            if (status === "rejected" || status === "removed" || status === "approved") {
              try {
                localStorage.removeItem(`pending_app_${groupId}_${userId}`);
              } catch {}
            }
            const res = {
              id: snap.id,
              groupId,
              userId,
              ...data,
              status,
              appliedAt: toIsoStringSafe(data.appliedAt || data.createdAt),
              joinedAt: toIsoStringSafe(data.joinedAt),
              rejectedAt: toIsoStringSafe(data.rejectedAt),
              removedAt: toIsoStringSafe(data.removedAt),
              updatedAt: toIsoStringSafe(data.updatedAt),
            };
            pageCache.set(`membership_${groupId}_${userId}`, res, 5 * 60 * 1000);
            callback(res);
          } else {
            trigger();
          }
        },
        (err) => {
          console.warn("[group.service] subscribeToMyMembership compound snapshot error:", err);
        }
      )
    );
  } catch {}

  // Listen to collection query for this user
  try {
    const q = query(collection(db, "group-memberships"), where("userId", "==", userId));
    unsubs.push(
      onSnapshot(
        q,
        () => trigger(),
        (err) => {
          console.warn("[group.service] subscribeToMyMembership query snapshot error:", err);
        }
      )
    );
  } catch {}

  return () => {
    unsubs.forEach((u) => u?.());
  };
}

/**
 * Subscribe to real-time changes to all memberships for a user.
 * Used by the Groups page so group cards update live.
 * @param {string} userId
 * @param {function} callback
 * @returns {function} Unsubscribe function
 */
export function subscribeToMyMemberships(userId, callback) {
  if (!userId || typeof callback !== "function") {
    return () => {};
  }

  const unsubs = [];
  const trigger = async () => {
    try {
      const list = await getMyMemberships();
      callback(list);
    } catch (err) {
      console.warn("[group.service] subscribeToMyMemberships error:", err);
    }
  };

  try {
    const q = query(collection(db, "group-memberships"), where("userId", "==", userId));
    unsubs.push(
      onSnapshot(q, () => trigger(), (err) => {
        console.warn("[group.service] subscribeToMyMemberships query error:", err);
      })
    );
  } catch {}

  return () => {
    unsubs.forEach((u) => u?.());
  };
}

// ============================================================
// MEMBERSHIP — ADMIN/MANAGER
// ============================================================

/**
 * Get a specific membership for a group member.
 * Requires members.view permission.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export async function getMembership(groupId, userId) {
  try {
    const data = await apiRequest(
      `${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships/${encodeURIComponent(userId)}`,
    );
    if (data?.data) return data.data;
  } catch {}

  try {
    const snap = await getDoc(doc(db, "group-memberships", `${groupId}_${userId}`));
    if (snap.exists()) {
      const data = snap.data();
      const appliedAt = data.appliedAt?.toDate ? data.appliedAt.toDate().toISOString() : data.appliedAt;
      const joinedAt = data.joinedAt?.toDate ? data.joinedAt.toDate().toISOString() : data.joinedAt;
      return {
        id: snap.id,
        ...data,
        appliedAt: appliedAt || data.appliedAt,
        joinedAt: joinedAt || data.joinedAt,
      };
    }
  } catch {}

  return null;
}

/**
 * Get approved members of a group.
 * Merges API and Firestore data.
 * @param {string} groupId
 * @returns {Promise<Array>}
 */
export async function getGroupMembers(groupId, options = {}) {
  if (!groupId) return [];
  const cacheKey = `group_members_${groupId}`;
  const cached = pageCache.get(cacheKey);
  const map = new Map();

  const ingestMembers = (docs) => {
    if (!docs) return;
    for (const d of docs) {
      if (!d) continue;
      const data = typeof d.data === "function" ? d.data() : d;
      const rawGroupId = data.groupId || (d.id?.includes("_") ? d.id.split("_")[0] : groupId);
      const isApproved = data.status === "approved" || (!data.status && d.ref?.parent?.id === "memberships");
      if (String(rawGroupId).trim() === String(groupId).trim() && isApproved) {
        const docUserId = data.userId || (d.id?.includes("_") ? d.id.split("_")[1] : d.id);
        const id = d.id || `${groupId}_${docUserId}`;
        const joinedAt = data.joinedAt?.toDate ? data.joinedAt.toDate().toISOString() : data.joinedAt;
        const appliedAt = data.appliedAt?.toDate ? data.appliedAt.toDate().toISOString() : data.appliedAt;
        const existing = map.get(id) || {};
        map.set(id, {
          id,
          groupId,
          userId: docUserId,
          ...existing,
          ...data,
          status: "approved",
          joinedAt: joinedAt || existing.joinedAt || appliedAt || new Date().toISOString(),
          appliedAt: appliedAt || existing.appliedAt,
        });
      }
    }
  };

  const knownUserId = options?.userId || options?.farmerId;
  if (knownUserId) {
    try {
      const snap = await getDoc(doc(db, "group-memberships", `${groupId}_${knownUserId}`));
      if (snap.exists()) ingestMembers([snap]);
    } catch {}
    try {
      const snap = await getDoc(doc(db, "group_memberships", `${groupId}_${knownUserId}`));
      if (snap.exists()) ingestMembers([snap]);
    } catch {}
  }

  // 1. Direct Firestore first
  try {
    const q = query(
      collection(db, "group-memberships"),
      where("groupId", "==", groupId)
    );
    const snap = await getDocs(q);
    ingestMembers(snap.docs);
  } catch {}

  try {
    const q = query(
      collection(db, "group_memberships"),
      where("groupId", "==", groupId)
    );
    const snap = await getDocs(q);
    ingestMembers(snap.docs);
  } catch {}

  // If filtered queries returned nothing, scan collections directly
  if (map.size === 0) {
    try {
      const snap = await getDocs(collection(db, "group-memberships"));
      ingestMembers(snap.docs);
    } catch {}
  }
  if (map.size === 0) {
    try {
      const snap = await getDocs(collection(db, "group_memberships"));
      ingestMembers(snap.docs);
    } catch {}
  }

  try {
    const snap = await getDocs(collection(db, "groups", groupId, "memberships"));
    ingestMembers(snap.docs);
  } catch {}

  // Also include the current user if their membership in this group is approved
  const currentUser = auth.currentUser;
  if (currentUser?.uid) {
    try {
      const myMem = await getMyMembership(groupId);
      if (myMem && myMem.status === "approved") {
        const id = `${groupId}_${currentUser.uid}`;
        if (!map.has(id)) {
          map.set(id, {
            id,
            groupId,
            userId: currentUser.uid,
            status: "approved",
            joinedAt: myMem.joinedAt || new Date().toISOString(),
            appliedAt: myMem.appliedAt,
          });
        }
      }
    } catch {}
  }

  const list = Array.from(map.values());
  if (list.length > 0) {
    pageCache.set(cacheKey, list, 2 * 60 * 1000);
    return list;
  }

  // 2. Fetch from API fallback
  try {
    const data = await apiRequest(
      `${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships`,
    );
    const apiList = data?.data ?? [];
    if (Array.isArray(apiList)) {
      for (const item of apiList) {
        const id = item.id || `${item.groupId || groupId}_${item.userId}`;
        map.set(id, { ...item, id, groupId: item.groupId || groupId });
      }
    }
  } catch (err) {
    console.warn("[group.service] API getGroupMembers failed:", err);
  }

  const finalMembers = Array.from(map.values());
  if (finalMembers.length > 0) {
    pageCache.set(cacheKey, finalMembers, 2 * 60 * 1000);
    return finalMembers;
  }

  return cached || [];
}

/**
 * Get pending applications for a group.
 * Merges API and Firestore data, strictly deduplicating by applicant userId.
 * @param {string} groupId
 * @returns {Promise<Array>}
 */
export async function getGroupApplications(groupId) {
  if (!groupId) return [];
  const map = new Map();

  // 1. Fetch from API
  try {
    const data = await apiRequest(
      `${GROUPS_BASE}/${encodeURIComponent(groupId)}/applications`,
    );
    const apiList = data?.data ?? (Array.isArray(data) ? data : []);
    if (Array.isArray(apiList)) {
      for (const item of apiList) {
        const uId = String(
          item.userId ||
          item.applicantId ||
          item.farmerId ||
          item.memberId ||
          (item.user && (item.user._id || item.user.id || item.user.uid)) ||
          (item.farmer && (item.farmer._id || item.farmer.id || item.farmer.uid)) ||
          (item.id && item.id.includes("_") ? item.id.split("_")[1] : "") ||
          item.id ||
          item._id ||
          ""
        ).trim();

        if (!uId) continue;
        const appliedAt = toIsoStringSafe(item.appliedAt || item.createdAt);
        map.set(uId, {
          ...item,
          id: `${groupId}_${uId}`,
          groupId,
          userId: uId,
          status: "pending",
          appliedAt: appliedAt || new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn("[group.service] API getGroupApplications failed:", err);
  }

  // 2. Fetch from Firestore across multiple potential paths
  const ingestApplications = (docs) => {
    for (const d of docs) {
      const data = d.data();
      const rawGroupId = data.groupId || (d.id.includes("_") ? d.id.split("_")[0] : groupId);
      const isGroupMatch = String(rawGroupId).trim() === String(groupId).trim();
      const isPending = data.status === "pending" || (!data.status && (data.isApplication || data.isFreshApplication));

      if (isGroupMatch && isPending) {
        const docUserId = data.userId || (d.id.includes("_") ? d.id.split("_")[1] : d.id);
        if (!docUserId) continue;
        const uId = String(docUserId).trim();

        const appliedAt = toIsoStringSafe(data.appliedAt || data.createdAt || data.updatedAt);
        const existing = map.get(uId);

        if (!existing) {
          map.set(uId, {
            id: `${groupId}_${uId}`,
            groupId,
            userId: uId,
            status: "pending",
            ...data,
            appliedAt: appliedAt || new Date().toISOString(),
          });
        } else {
          // Merge prioritizing newer timestamp
          const existTime = getRecordTimestamp(existing);
          const newTime = getRecordTimestamp(data);
          if (newTime >= existTime) {
            map.set(uId, {
              ...existing,
              ...data,
              id: `${groupId}_${uId}`,
              groupId,
              userId: uId,
              status: "pending",
              appliedAt: appliedAt || existing.appliedAt,
            });
          }
        }
      }
    }
  };

  // 2A. Subcollection groups/{groupId}/applications (open to all authenticated users)
  try {
    const snap = await getDocs(collection(db, "groups", groupId, "applications"));
    ingestApplications(snap.docs);
  } catch (err) {
    console.warn("[group.service] getDocs groups/applications failed:", err);
  }

  // 2B. Direct Firestore group-memberships
  try {
    const snap = await getDocs(collection(db, "group-memberships"));
    ingestApplications(snap.docs);
  } catch {
    try {
      const q = query(collection(db, "group-memberships"), where("groupId", "==", groupId));
      const snap = await getDocs(q);
      ingestApplications(snap.docs);
    } catch {}
  }

  // 2C. group_memberships
  try {
    const snap = await getDocs(collection(db, "group_memberships"));
    ingestApplications(snap.docs);
  } catch {}

  // 3. Ingest from local storage broadcast cache (same device / multi-tab)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`pending_app_${groupId}_`)) {
        const app = JSON.parse(localStorage.getItem(key));
        if (app && (app.status === "pending" || !app.status) && app.userId) {
          const uId = String(app.userId).trim();
          const existing = map.get(uId);
          if (!existing) {
            map.set(uId, { ...app, id: `${groupId}_${uId}`, groupId, userId: uId, status: "pending" });
          } else {
            map.set(uId, { ...existing, ...app, id: `${groupId}_${uId}`, groupId, userId: uId });
          }
        }
      }
    }
  } catch {}

  const apps = Array.from(map.values());

  // 4. Enrich any applications that lack applicant profile details
  await Promise.all(
    apps.map(async (app) => {
      if (!app.applicantName || !app.applicantEmail) {
        try {
          const profile = await getUserProfile(app.userId);
          if (profile) {
            app.applicantName = app.applicantName || profile.fullname || profile.displayName || profile.fullName || profile.username;
            app.applicantUsername = app.applicantUsername || profile.username;
            app.applicantEmail = app.applicantEmail || profile.email;
            app.applicantPhone = app.applicantPhone || profile.phone || profile.contactNumber;
            app.applicantLocation = app.applicantLocation || (typeof profile.location === "object" ? (profile.location?.address || profile.location?.city) : profile.location);
            app.applicantAvatar = app.applicantAvatar || profile.profilePicture;
            app.applicantRole = app.applicantRole || profile.role || "farmer";
            app.applicantVerified = profile.verificationStatus === "approved" || profile.verified === true;
            app.applicantBio = profile.bio;
          }
        } catch {}
      }
    })
  );

  // Sort by appliedAt descending (newest first)
  apps.sort((a, b) => getRecordTimestamp(b) - getRecordTimestamp(a));

  return apps;
}

/**
 * Subscribe to real-time pending applications for a group.
 * @param {string} groupId
 * @param {function} callback - Receives array of applications
 * @returns {function} Unsubscribe function
 */
export function subscribeToGroupApplications(groupId, callback) {
  if (!groupId || typeof callback !== "function") {
    return () => {};
  }

  const unsubs = [];
  const trigger = async () => {
    try {
      const apps = await getGroupApplications(groupId);
      callback(apps);
    } catch (err) {
      console.warn("[group.service] subscribeToGroupApplications error:", err);
    }
  };

  // Immediate trigger so caller receives pending apps right away
  trigger();

  try {
    unsubs.push(onSnapshot(collection(db, "groups", groupId, "applications"), trigger, () => {}));
  } catch {}
  try {
    unsubs.push(onSnapshot(collection(db, "group-memberships"), trigger, () => {}));
  } catch {}
  try {
    unsubs.push(onSnapshot(collection(db, "group_memberships"), trigger, () => {}));
  } catch {}

  return () => {
    unsubs.forEach((u) => u?.());
  };
}

/**
 * Subscribe to real-time members for a group.
 * @param {string} groupId
 * @param {function} callback - Receives array of members
 * @returns {function} Unsubscribe function
 */
export function subscribeToGroupMembers(groupId, callback) {
  if (!groupId || typeof callback !== "function") {
    return () => {};
  }

  const unsubs = [];
  const trigger = async () => {
    try {
      const members = await getGroupMembers(groupId);
      callback(members);
    } catch (err) {
      console.warn("[group.service] subscribeToGroupMembers error:", err);
    }
  };

  try {
    unsubs.push(onSnapshot(collection(db, "group-memberships"), trigger, () => {}));
  } catch {}
  try {
    unsubs.push(onSnapshot(collection(db, "group_memberships"), trigger, () => {}));
  } catch {}
  try {
    unsubs.push(onSnapshot(collection(db, "groups", groupId, "memberships"), trigger, () => {}));
  } catch {}

  return () => {
    unsubs.forEach((u) => u?.());
  };
}

/**
 * Approve a membership application.
 * Requires applications.approve permission.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>} Updated membership
 */
export async function approveApplication(groupId, userId) {
  const membershipId = `${groupId}_${userId}`;
  const updates = {
    id: membershipId,
    groupId,
    userId,
    status: "approved",
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // 1. Update API
  try {
    await apiRequest(
      `${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships/${encodeURIComponent(userId)}/approve`,
      { method: "POST", body: JSON.stringify({}) },
    );
  } catch (err) {
    console.warn("[group.service] API approveApplication failed, continuing with Firestore:", err);
  }

  // 2. Update Firestore across collections
  try {
    await setDoc(doc(db, "group-memberships", membershipId), updates, { merge: true });
  } catch (fsErr) {
    console.warn("[group.service] Firestore approveApplication update failed:", fsErr);
  }
  try {
    await setDoc(doc(db, "group_memberships", membershipId), updates, { merge: true });
  } catch {}
  try {
    await setDoc(doc(db, "groups", groupId, "memberships", userId), updates, { merge: true });
  } catch {}

  // 3. Clean up any auxiliary application docs
  try {
    const q = query(collection(db, "group-memberships"), where("userId", "==", userId));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      if (d.id !== membershipId) {
        const dData = d.data();
        if (dData.groupId === groupId && (dData.status === "pending" || dData.isFreshApplication)) {
          await deleteDoc(d.ref).catch(() => {});
        }
      }
    }
  } catch {}

  try {
    await deleteDoc(doc(db, "groups", groupId, "applications", userId)).catch(() => {});
  } catch {}

  try {
    localStorage.removeItem(`pending_app_${groupId}_${userId}`);
  } catch {}

  pageCache.invalidate(`membership_${groupId}_${userId}`);
  pageCache.invalidate(`my_memberships_${userId}`);
  pageCache.invalidate(`group_count_${groupId}`);
  pageCache.invalidate(`group_members_${groupId}`);
  invalidateApprovedGroupsCache(userId);
  return { id: membershipId, groupId, userId, status: "approved" };
}

/**
 * Reject a membership application.
 * Requires applications.reject permission.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>} Updated membership
 */
export async function rejectApplication(groupId, userId) {
  const membershipId = `${groupId}_${userId}`;
  const updates = {
    id: membershipId,
    groupId,
    userId,
    status: "rejected",
    rejectedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // 1. Update API
  try {
    await apiRequest(
      `${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships/${encodeURIComponent(userId)}/reject`,
      { method: "POST", body: JSON.stringify({}) },
    );
  } catch (err) {
    console.warn("[group.service] API rejectApplication failed, continuing with Firestore:", err);
  }

  // 2. Update Firestore compound doc
  try {
    await setDoc(doc(db, "group-memberships", membershipId), updates, { merge: true });
  } catch (fsErr) {
    console.warn("[group.service] Firestore rejectApplication update failed:", fsErr);
  }
  try {
    await setDoc(doc(db, "group_memberships", membershipId), updates, { merge: true });
  } catch {}

  // 3. Clean up/update any other docs for this user and group
  try {
    const q = query(collection(db, "group-memberships"), where("userId", "==", userId));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      const dData = d.data();
      const rawGid = dData.groupId || (d.id.includes("_") ? d.id.split("_")[0] : null);
      if (String(rawGid).trim() === String(groupId).trim()) {
        if (d.id !== membershipId) {
          await deleteDoc(d.ref).catch(() => {});
        } else {
          await setDoc(d.ref, updates, { merge: true }).catch(() => {});
        }
      }
    }
  } catch {}

  try {
    await deleteDoc(doc(db, "groups", groupId, "applications", userId)).catch(() => {});
  } catch {}

  try {
    localStorage.removeItem(`pending_app_${groupId}_${userId}`);
  } catch {}

  pageCache.invalidate(`membership_${groupId}_${userId}`);
  pageCache.invalidate(`my_memberships_${userId}`);
  return { id: membershipId, groupId, userId, status: "rejected" };
}

/**
 * Remove a member from a group.
 * Requires members.remove permission.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>} Updated membership
 */
export async function removeGroupMember(groupId, userId) {
  const membershipId = `${groupId}_${userId}`;
  const updates = {
    id: membershipId,
    groupId,
    userId,
    status: "removed",
    removedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // 1. Update API
  try {
    await apiRequest(
      `${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships/${encodeURIComponent(userId)}`,
      { method: "DELETE" },
    );
  } catch (err) {
    console.warn("[group.service] API removeGroupMember failed, continuing with Firestore:", err);
  }

  // 2. Set status to "removed" in Firestore so the farmer sees the removed indication and can re-apply
  try {
    await setDoc(doc(db, "group-memberships", membershipId), updates, { merge: true });
  } catch (fsErr) {
    console.warn("[group.service] Firestore removeGroupMember update failed:", fsErr);
  }
  try {
    await setDoc(doc(db, "group_memberships", membershipId), updates, { merge: true });
  } catch {}

  // 3. Remove from subcollection memberships if present
  try {
    await deleteDoc(doc(db, "groups", groupId, "memberships", userId)).catch(() => {});
  } catch {}

  // 4. Clean up any auxiliary docs for this user and group
  try {
    const q = query(collection(db, "group-memberships"), where("userId", "==", userId));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      const dData = d.data();
      const rawGid = dData.groupId || (d.id.includes("_") ? d.id.split("_")[0] : null);
      if (String(rawGid).trim() === String(groupId).trim() && d.id !== membershipId) {
        await deleteDoc(d.ref).catch(() => {});
      }
    }
  } catch {}

  try {
    localStorage.removeItem(`pending_app_${groupId}_${userId}`);
  } catch {}

  pageCache.invalidate(`membership_${groupId}_${userId}`);
  pageCache.invalidate(`my_memberships_${userId}`);
  pageCache.invalidate(`group_count_${groupId}`);
  pageCache.invalidate(`group_members_${groupId}`);
  invalidateApprovedGroupsCache(userId);
  return { id: membershipId, groupId, userId, status: "removed" };
}

/**
 * Get the count of approved members in a group.
 * @param {string} groupId
 * @returns {Promise<number>}
 */
export async function getGroupMemberCount(groupId, options = {}) {
  if (!groupId) return 0;
  const cacheKey = `group_count_${groupId}`;
  const cached = pageCache.get(cacheKey);
  if (typeof cached === "number" && cached > 0) return cached;

  try {
    const members = await getGroupMembers(groupId, options);
    let count = members.length;
    if (count === 0) {
      const groupData = await getGroup(groupId);
      if (typeof groupData?.memberCount === "number" && groupData.memberCount > 0) {
        count = groupData.memberCount;
      } else if (Array.isArray(groupData?.members) && groupData.members.length > 0) {
        count = groupData.members.length;
      }
    }
    if (count === 0 && (options?.farmerId || options?.userId)) {
      count = 1;
    }
    if (count > 0) {
      pageCache.set(cacheKey, count, 2 * 60 * 1000);
    }
    return count;
  } catch {
    const fallback = (options?.farmerId || options?.userId) ? 1 : 0;
    return (typeof cached === "number" && cached > 0) ? cached : fallback;
  }
}

// ============================================================
// USER GROUPS — PUBLIC DISPLAY
// ============================================================

/**
 * Get a user's approved group memberships enriched with group info.
 * Used for profile display.
 * @param {string} userId
 * @returns {Promise<Array>} Array of { groupId, groupName, groupImageUrl, appliedAt }
 */
export async function getUserApprovedGroups(userId) {
  if (!userId) {
    return [];
  }

  const cacheKey = approvedGroupsCacheKey(userId);
  const cached = pageCache.get(cacheKey);
  if (Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  // 1. API attempt
  try {
    const data = await apiRequest(
      `${GROUPS_BASE}/user/${encodeURIComponent(userId)}/approved-groups`,
      { requireAuth: false },
    );
    const groups = data.data ?? [];
    if (Array.isArray(groups) && groups.length > 0) {
      pageCache.set(cacheKey, groups, APPROVED_GROUPS_CACHE_TTL);
      return groups;
    }
  } catch (err) {
    console.warn("[group.service] API approved-groups failed, checking Firestore:", err);
  }

  // 2. Direct Firestore resilient query
  try {
    const groupMap = new Map();

    const processDocs = (docs) => {
      for (const d of docs) {
        const data = d.data();
        if (data.status === "approved") {
          const gId = data.groupId || (d.id.includes("_") ? d.id.split("_")[0] : null);
          if (gId) {
            groupMap.set(String(gId).trim(), data);
          }
        }
      }
    };

    // 2A. Query group-memberships by userId
    try {
      const q1 = query(collection(db, "group-memberships"), where("userId", "==", userId));
      const snap1 = await getDocs(q1);
      processDocs(snap1.docs);
    } catch {}

    // 2B. Query group_memberships by userId
    try {
      const q2 = query(collection(db, "group_memberships"), where("userId", "==", userId));
      const snap2 = await getDocs(q2);
      processDocs(snap2.docs);
    } catch {}

    // 2C. If user is currently authenticated user, also check cached memberships
    if (auth.currentUser?.uid === userId) {
      const myCached = pageCache.get(`my_memberships_${userId}`);
      if (Array.isArray(myCached)) {
        for (const m of myCached) {
          if (m.status === "approved" && m.groupId) {
            groupMap.set(String(m.groupId).trim(), m);
          }
        }
      }
    }

    const groupIds = Array.from(groupMap.keys());
    if (groupIds.length === 0) return [];

    const groupPromises = groupIds.map(async (gId) => {
      try {
        const gDoc = await getDoc(doc(db, "groups", gId)).catch(() => null);
        if (gDoc?.exists()) {
          const gData = gDoc.data();
          return {
            groupId: gId,
            groupName: gData.name,
            groupImageUrl: gData.imageUrl || null,
          };
        }
      } catch {}
      return null;
    });

    const results = (await Promise.all(groupPromises)).filter(Boolean);
    if (results.length > 0) {
      pageCache.set(cacheKey, results, APPROVED_GROUPS_CACHE_TTL);
    }
    return results;
  } catch {
    return [];
  }
}

// ============================================================
// MANAGER — AUTHENTICATED USER (/me)
// ============================================================

/**
 * Get the authenticated user's managed groups.
 * @returns {Promise<Array>} Array of manager objects
 */
export async function getMyManagedGroups() {
  const data = await apiRequest(`${GROUPS_BASE}/me/managed`);
  return data.data ?? [];
}

// ============================================================
// MANAGER — ADMIN
// ============================================================

/**
 * Get all active managers for a group.
 * Requires group manager status.
 * @param {string} groupId
 * @returns {Promise<Array>}
 */
export async function getGroupManagers(groupId) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/managers`,
  );
  return data.data ?? [];
}

/**
 * Get a specific manager record.
 * Requires group manager status.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export async function getGroupManager(groupId, userId) {
  const currentUser = auth.currentUser;
  // If the logged-in user is platform admin, automatically grant full management rights
  if (currentUser?.uid === userId) {
    try {
      const userProfile = await getUserProfile(userId);
      if (userProfile?.role === "admin") {
        return {
          groupId,
          userId,
          active: true,
          permissions: Object.values(GROUP_PERMISSIONS),
        };
      }
    } catch {}
  }

  try {
    const data = await apiRequest(
      `${GROUPS_BASE}/${encodeURIComponent(groupId)}/managers/${encodeURIComponent(userId)}`,
    );
    if (data?.data) return data.data;
  } catch {}

  try {
    const snap = await getDoc(doc(db, "group-managers", `${groupId}_${userId}`));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  } catch {}

  return null;
}

/**
 * Assign a user as manager of a group (admin only).
 * @param {string} groupId
 * @param {string} userId
 * @param {string[]} permissions
 * @returns {Promise<Object>} Manager record
 */
export async function assignGroupManager(groupId, userId, permissions) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/managers`,
    {
      method: "POST",
      body: JSON.stringify({ userId, permissions }),
    },
  );
  return data.data;
}

/**
 * Update a manager's permissions (admin only).
 * @param {string} groupId
 * @param {string} userId
 * @param {string[]} permissions
 * @returns {Promise<Object>} Updated manager record
 */
export async function updateManagerPermissions(groupId, userId, permissions) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/managers/${encodeURIComponent(userId)}/permissions`,
    {
      method: "PATCH",
      body: JSON.stringify({ permissions }),
    },
  );
  return data.data;
}

/**
 * Remove a manager from a group (admin only).
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>} Deactivated manager record
 */
export async function removeGroupManager(groupId, userId) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/managers/${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );
  return data.data;
}
