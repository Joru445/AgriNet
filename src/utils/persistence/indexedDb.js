import { openDB } from "idb";

export const STATE_DB_NAME = "agrinet_state";
export const STATE_DB_VERSION = 1;

export const PRODUCT_DRAFTS_STORE = "productDrafts";
export const DRAFT_IMAGES_STORE = "draftImages";
export const PRODUCT_SNAPSHOTS_STORE = "productSnapshots";

let dbPromise = null;
let unavailableReason = null;

export function isIndexedDbAvailable() {
  try {
    return typeof globalThis !== "undefined" && Boolean(globalThis.indexedDB);
  } catch {
    return false;
  }
}

export function getPersistenceUnavailableReason() {
  return unavailableReason;
}

function upgrade(db) {
  if (!db.objectStoreNames.contains(PRODUCT_DRAFTS_STORE)) {
    const drafts = db.createObjectStore(PRODUCT_DRAFTS_STORE, {
      keyPath: "id",
    });
    drafts.createIndex("updatedAt", "updatedAt");
    drafts.createIndex("createdByUid", "createdByUid");
  }

  if (!db.objectStoreNames.contains(DRAFT_IMAGES_STORE)) {
    const images = db.createObjectStore(DRAFT_IMAGES_STORE, {
      keyPath: "id",
    });
    images.createIndex("draftId", "draftId");
    images.createIndex("createdByUid", "createdByUid");
  }

  if (!db.objectStoreNames.contains(PRODUCT_SNAPSHOTS_STORE)) {
    const snapshots = db.createObjectStore(PRODUCT_SNAPSHOTS_STORE, {
      keyPath: "key",
    });
    snapshots.createIndex("uid", "uid");
  }
}

export function getDb() {
  if (!isIndexedDbAvailable()) {
    unavailableReason = "IndexedDB is not available in this browser.";
    return Promise.resolve(null);
  }

  if (!dbPromise) {
    dbPromise = openDB(STATE_DB_NAME, STATE_DB_VERSION, {
      upgrade,
      blocked() {
        unavailableReason = "Persistence is blocked by another open tab.";
      },
      blocking() {
        unavailableReason = "Persistence is upgrading in another tab.";
      },
      terminated() {
        dbPromise = null;
        unavailableReason = "Persistence connection was terminated.";
      },
    }).catch((error) => {
      dbPromise = null;
      unavailableReason = error?.message || "Persistence could not be opened.";
      console.warn("[persistence] IndexedDB unavailable:", error);
      return null;
    });
  }

  return dbPromise;
}

/**
 * Run a transaction and return its callback result.
 * Returns null when persistence is unavailable rather than throwing at callers.
 */
export async function withStore(storeNames, mode, callback) {
  const db = await getDb();
  if (!db) return null;

  const names = Array.isArray(storeNames) ? storeNames : [storeNames];
  // A single transaction spans every requested store so cascading deletes
  // cannot leave an orphaned draft or image behind.
  const tx = db.transaction(names, mode);
  try {
    const result = await callback(
      ...names.map((name) => tx.objectStore(name)),
      tx,
    );
    await tx.done;
    return result;
  } catch (error) {
    try {
      tx.abort();
    } catch {
      /* transaction may already be complete */
    }
    throw error;
  }
}

export function isQuotaExceededError(error) {
  return Boolean(
    error &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        error.code === 22 ||
        error.code === 1014),
  );
}

export async function estimateStorage() {
  try {
    if (globalThis.navigator?.storage?.estimate) {
      return await globalThis.navigator.storage.estimate();
    }
  } catch {
    /* Storage estimation is optional. */
  }
  return null;
}
