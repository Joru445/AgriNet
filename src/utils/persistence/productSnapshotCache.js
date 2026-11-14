import {
  PRODUCT_SNAPSHOTS_STORE,
  isQuotaExceededError,
  withStore,
} from "./indexedDb";

const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function cacheKey(uid, key) {
  return uid && key ? `${uid}:${key}` : "";
}

export async function loadProductSnapshot(
  uid,
  key,
  maxAgeMs = DEFAULT_MAX_AGE_MS,
) {
  const id = cacheKey(uid, key);
  if (!id) return null;

  const record = await withStore(PRODUCT_SNAPSHOTS_STORE, "readonly", (store) =>
    store.get(id),
  );
  if (!record || record.uid !== uid) return null;
  if (Date.now() - Number(record.savedAt || 0) > maxAgeMs) {
    await deleteProductSnapshot(uid, key);
    return null;
  }
  return record.data ?? null;
}

export async function saveProductSnapshot(uid, key, data) {
  const id = cacheKey(uid, key);
  if (!id) return null;

  const record = {
    key: id,
    uid,
    data,
    savedAt: Date.now(),
  };

  try {
    return await withStore(PRODUCT_SNAPSHOTS_STORE, "readwrite", async (store) => {
      await store.put(record);
      return record;
    });
  } catch (error) {
    if (!isQuotaExceededError(error)) throw error;
    await clearProductSnapshotCache(uid);
    return withStore(PRODUCT_SNAPSHOTS_STORE, "readwrite", async (store) => {
      await store.put(record);
      return record;
    });
  }
}

export async function deleteProductSnapshot(uid, key) {
  const id = cacheKey(uid, key);
  if (!id) return false;
  return withStore(PRODUCT_SNAPSHOTS_STORE, "readwrite", async (store) => {
    await store.delete(id);
    return true;
  });
}

export async function clearProductSnapshotCache(uid) {
  if (!uid) return false;
  return withStore(PRODUCT_SNAPSHOTS_STORE, "readwrite", async (store) => {
    const keys = await store.index("uid").getAllKeys(uid);
    await Promise.all(keys.map((key) => store.delete(key)));
    return true;
  });
}
