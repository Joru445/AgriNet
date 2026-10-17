// ============================================================
// Groups API Service
// ============================================================
//
// Frontend service for the Groups API. Membership and manager data are private
// and therefore never falls back to client Firestore reads.
// Uses the centralized apiRequest client for all HTTP calls.
// ============================================================

import { apiRequest } from "./api/api.client";
import * as pageCache from "../utils/pageCache";
import { auth } from "../firebase/auth";
import { getUserProfile } from "./user.service";
import { GROUP_PERMISSIONS } from "../constants/groupPermissions";

const GROUPS_BASE = "/v1/groups";
const APPROVED_GROUPS_CACHE_TTL = 2 * 60 * 1000;
const PUBLIC_GROUPS_CACHE_KEY = "all_groups";
const PUBLIC_GROUPS_CACHE_TTL = 24 * 60 * 60 * 1000;
let publicGroupsRequest = null;
let publicGroupsCacheVersion = 0;
const groupCountRequests = new Map();

function invalidatePublicGroupsCache() {
  publicGroupsCacheVersion += 1;
  pageCache.invalidate(PUBLIC_GROUPS_CACHE_KEY);
}

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
  const cached = pageCache.get(PUBLIC_GROUPS_CACHE_KEY);
  if (cached) return cached;

  // Desktop and mobile filters can open concurrently. Share the same public
  // request instead of issuing one request per mounted filter component.
  if (publicGroupsRequest) return publicGroupsRequest;

  // Public group discovery is served by the redacting public API and can use
  // the in-memory cache while offline; do not expose raw group documents.
  // Failures are deliberately not cached as successful empty results.
  const requestVersion = publicGroupsCacheVersion;
  publicGroupsRequest = apiRequest(`${GROUPS_BASE}?active=true`, { requireAuth: false })
    .then((data) => {
      const uniqueMap = new Map();
      for (const group of data?.data ?? []) {
        if (group?.active === false || !group?.name || !String(group.name).trim()) continue;
        const name = String(group.name).trim();
        const normalizedName = name.toLowerCase();
        if (!uniqueMap.has(normalizedName)) uniqueMap.set(normalizedName, { ...group, name });
      }
      const groups = Array.from(uniqueMap.values());
      // Empty is a valid, cacheable response; it prevents repeated requests
      // when no active groups exist.
      // Do not repopulate the cache from a list that predates a group
      // mutation which invalidated it while this request was in flight.
      if (requestVersion === publicGroupsCacheVersion) {
        pageCache.set(PUBLIC_GROUPS_CACHE_KEY, groups, PUBLIC_GROUPS_CACHE_TTL);
      }
      return groups;
    })
    .finally(() => {
      publicGroupsRequest = null;
    });

  return publicGroupsRequest;
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

  try {
    const data = await apiRequest(`${GROUPS_BASE}/${encodeURIComponent(groupId)}`, { requireAuth: false });
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
  invalidatePublicGroupsCache();
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
  invalidatePublicGroupsCache();
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
  invalidatePublicGroupsCache();
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
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("You must be logged in to apply.");
  // The API validates farmer role, active group, duplicate applications and
  // writes one canonical membership. Never fabricate client-side approvals.
  const result = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/apply`,
    { method: "POST", body: JSON.stringify({}) },
  );
  const membership = result.data ?? result.membership ?? null;
  pageCache.invalidate(`my_memberships_${userId}`);
  pageCache.invalidate(`membership_${groupId}_${userId}`);
  return membership;
}

/**
 * Get the authenticated user's memberships across all groups.
 * Merges API and Firestore data.
 * @returns {Promise<Array>} Array of membership objects
 */
export async function getMyMemberships() {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  const response = await apiRequest(`${GROUPS_BASE}/me/memberships`);
  const data = response.data ?? [];
  pageCache.set(`my_memberships_${uid}`, data, 60_000);
  return data;
}

/**
 * Get the authenticated user's membership for a specific group.
 * @param {string} groupId
 * @returns {Promise<Object|null>} Membership object or null
 */
export async function getMyMembership(groupId) {
  const uid = auth.currentUser?.uid;
  if (!uid || !groupId) return null;
  const memberships = await getMyMemberships();
  return memberships.find((m) => m.groupId === groupId) ?? null;
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
  const trigger = async () => {
    try {
      const mem = await getMyMembership(groupId);
      callback(mem);
    } catch (err) {
      console.warn("[group.service] subscribeToMyMembership error:", err);
    }
  };

  trigger();
  const onChanged = () => trigger();
  globalThis.addEventListener?.("agrinet:groups-changed", onChanged);
  return () => globalThis.removeEventListener?.("agrinet:groups-changed", onChanged);
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

  const trigger = async () => {
    try {
      const list = await getMyMemberships();
      callback(list);
    } catch (err) {
      console.warn("[group.service] subscribeToMyMemberships error:", err);
    }
  };

  trigger();
  globalThis.addEventListener?.("agrinet:groups-changed", trigger);
  return () => globalThis.removeEventListener?.("agrinet:groups-changed", trigger);
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
  const data = await apiRequest(`${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships/${encodeURIComponent(userId)}`);
  return data?.data ?? null;
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
  // Only authorized manager/admin APIs may reveal the full member roster.
  // Direct collection scans bypassed visibility boundaries and are removed.
  const payload = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships`,
  );
  const members = (Array.isArray(payload?.data) ? payload.data : [])
    .filter((m) => m.status === "approved");
  pageCache.set(cacheKey, members, 2 * 60 * 1000);
  return members;
}

/**
 * Get pending applications for a group.
 * Merges API and Firestore data, strictly deduplicating by applicant userId.
 * @param {string} groupId
 * @returns {Promise<Array>}
 */
export async function getGroupApplications(groupId) {
  if (!groupId) return [];
  // Do not merge localStorage or legacy collection scans into authoritative
  // applications: stale or user-injected records must not appear actionable.
  const payload = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/applications`,
  );
  const applications = Array.isArray(payload?.data) ? payload.data : [];
  const pending = applications
    .filter((a) => a.status === "pending" && a.userId)
    .map((a) => ({ ...a, id: a.id || `${groupId}_${a.userId}`, groupId }));
  await Promise.all(pending.map(async (application) => {
    try {
      const profile = await getUserProfile(application.userId);
      if (profile) {
        application.applicantName = application.applicantName || profile.fullname || profile.username;
        application.applicantUsername = application.applicantUsername || profile.username;
        application.applicantAvatar = application.applicantAvatar || profile.profilePicture;
        application.applicantVerified = profile.verificationStatus === "approved" || profile.verified === true;
      }
    } catch { /* keep application even if public profile cannot be loaded */ }
  }));
  return pending.sort((a, b) => getRecordTimestamp(b) - getRecordTimestamp(a));
}

/**
 * Subscribe to real-time pending applications for a group.
 * @param {string} groupId
 * @param {function} callback - Receives array of applications
 * @returns {function} Unsubscribe function
 */
export function subscribeToGroupApplications(groupId, callback) {
  if (!groupId || typeof callback !== "function") return () => {};
  let cancelled = false;
  const refresh = async () => {
    try {
      const apps = await getGroupApplications(groupId);
      if (!cancelled) callback(apps);
    } catch (error) {
      if (!cancelled) console.warn("[subscribeToGroupApplications]", error);
    }
  };
  refresh();
  const interval = setInterval(refresh, 30_000);
  return () => { cancelled = true; clearInterval(interval); };
}

/**
 * Subscribe to real-time members for a group.
 * @param {string} groupId
 * @param {function} callback - Receives array of members
 * @returns {function} Unsubscribe function
 */
export function subscribeToGroupMembers(groupId, callback) {
  if (!groupId || typeof callback !== "function") return () => {};
  let cancelled = false;
  const refresh = async () => {
    try {
      const members = await getGroupMembers(groupId);
      if (!cancelled) callback(members);
    } catch (error) {
      if (!cancelled) console.warn("[subscribeToGroupMembers]", error);
    }
  };
  refresh();
  const interval = setInterval(refresh, 30_000);
  return () => { cancelled = true; clearInterval(interval); };
}

/**
 * Approve a membership application.
 * Requires applications.approve permission.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>} Updated membership
 */
export async function approveApplication(groupId, userId) {
  const result = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships/${encodeURIComponent(userId)}/approve`,
    { method: "POST", body: JSON.stringify({}) },
  );
  pageCache.invalidate(`membership_${groupId}_${userId}`);
  pageCache.invalidate(`my_memberships_${userId}`);
  pageCache.invalidate(`group_count_${groupId}`);
  pageCache.invalidate(`group_members_${groupId}`);
  invalidateApprovedGroupsCache(userId);
  return result.data ?? { id: `${groupId}_${userId}`, groupId, userId, status: "approved" };
}

/**
 * Reject a membership application.
 * Requires applications.reject permission.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>} Updated membership
 */
export async function rejectApplication(groupId, userId) {
  const result = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships/${encodeURIComponent(userId)}/reject`,
    { method: "POST", body: JSON.stringify({}) },
  );
  pageCache.invalidate(`membership_${groupId}_${userId}`);
  pageCache.invalidate(`my_memberships_${userId}`);
  pageCache.invalidate(`group_count_${groupId}`);
  pageCache.invalidate(`group_members_${groupId}`);
  invalidateApprovedGroupsCache(userId);
  return result.data ?? { id: `${groupId}_${userId}`, groupId, userId, status: "rejected" };
}

/**
 * Remove a member from a group.
 * Requires members.remove permission.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>} Updated membership
 */
export async function removeGroupMember(groupId, userId) {
  const result = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships/${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );
  pageCache.invalidate(`membership_${groupId}_${userId}`);
  pageCache.invalidate(`my_memberships_${userId}`);
  pageCache.invalidate(`group_count_${groupId}`);
  pageCache.invalidate(`group_members_${groupId}`);
  invalidateApprovedGroupsCache(userId);
  return result.data ?? { id: `${groupId}_${userId}`, groupId, userId, status: "removed" };
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
  if (typeof cached === "number") return cached;
  if (groupCountRequests.has(cacheKey)) return groupCountRequests.get(cacheKey);

  const request = (async () => {
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
    pageCache.set(cacheKey, count, 2 * 60 * 1000);
    return count;
    } catch {
    const fallback = (options?.farmerId || options?.userId) ? 1 : 0;
    return (typeof cached === "number") ? cached : fallback;
    }
  })().finally(() => groupCountRequests.delete(cacheKey));
  groupCountRequests.set(cacheKey, request);
  return request;
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
  if (!userId) return [];
  const cacheKey = approvedGroupsCacheKey(userId);
  const cached = pageCache.get(cacheKey);
  if (cached) return cached;
  const result = await apiRequest(`${GROUPS_BASE}/user/${encodeURIComponent(userId)}/approved-groups`, { requireAuth: false });
  const data = result.data ?? [];
  pageCache.set(cacheKey, data, APPROVED_GROUPS_CACHE_TTL);
  return data;
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

/** Manager-authorized direct enrollment of an eligible farmer. */
export async function addGroupMember(groupId, userId) {
  const response = await apiRequest(`${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships`, {
    method: "POST", body: JSON.stringify({ userId }),
  });
  invalidateApprovedGroupsCache(userId);
  pageCache.invalidate(`my_memberships_${userId}`);
  return response.data;
}
