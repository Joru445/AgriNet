import {
  DRAFT_IMAGES_STORE,
  PRODUCT_DRAFTS_STORE,
  isQuotaExceededError,
  withStore,
} from "./indexedDb";

export const PRODUCT_DRAFT_SCHEMA_VERSION = 1;
export const MAX_PRODUCT_DRAFTS = 10;
export const MAX_DRAFT_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function notifyDraftsChanged() {
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("agrinet:product-drafts-updated"));
    }
  } catch {
    /* non-browser environments */
  }
}

function randomId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    globalThis.crypto?.getRandomValues?.(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  } catch {
    return `draft_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

export function createDraftId() {
  return randomId();
}

function normalizeForm(form) {
  if (!form || typeof form !== "object" || Array.isArray(form)) return {};
  return { ...form };
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .filter((image) => image && typeof image === "object")
    .map((image) => {
      // Existing Cloudinary images may be raw `{ url }` objects (older
      // products) or already normalized draft descriptors.
      if (image.url) {
        return {
          id: image.id || randomId(),
          kind: "existing",
          url: image.url,
          ...(image.publicId ? { publicId: image.publicId } : {}),
        };
      }
      if (image.id) return { id: image.id, kind: "draft" };
      return null;
    })
    .filter(Boolean);
}

function normalizeDraft(input = {}) {
  const now = Date.now();
  const productId = input.productId || null;
  return {
    id: input.id || randomId(),
    mode: productId ? "edit" : "create",
    productId,
    form: normalizeForm(input.form),
    images: normalizeImages(input.images),
    step: [1, 2, 3].includes(Number(input.step)) ? Number(input.step) : 1,
    createdByUid: input.createdByUid || null,
    createdByName: input.createdByName || "",
    updatedByUid: input.updatedByUid || null,
    revision: Number(input.revision) || 1,
    createdAt: Number(input.createdAt) || now,
    updatedAt: Number(input.updatedAt) || now,
    schemaVersion: PRODUCT_DRAFT_SCHEMA_VERSION,
  };
}

async function listRaw() {
  const records = await withStore(
    PRODUCT_DRAFTS_STORE,
    "readonly",
    (store) => store.getAll(),
  );
  return Array.isArray(records)
    ? records.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    : [];
}

async function putDraft(record) {
  return withStore(PRODUCT_DRAFTS_STORE, "readwrite", async (store) => {
    await store.put(record);
    return record;
  });
}

export async function listProductDrafts() {
  await pruneProductDrafts();
  return listRaw();
}

export async function getProductDraft(id) {
  if (!id) return null;
  return withStore(PRODUCT_DRAFTS_STORE, "readonly", (store) => store.get(id));
}

export async function getLatestCreateDraft() {
  const records = await listRaw();
  const now = Date.now();
  return (
    records.find(
      (record) =>
        record.mode === "create" &&
        now - (record.updatedAt || 0) <= MAX_DRAFT_AGE_MS,
    ) || null
  );
}

export async function getDraftForProduct(productId) {
  if (!productId) return null;
  const records = await listRaw();
  return (
    records.find(
      (record) =>
        record.mode === "edit" && record.productId === productId,
    ) || null
  );
}

export async function saveProductDraft(input, user = null) {
  const existing = input?.id ? await getProductDraft(input.id) : null;
  const now = Date.now();
  const record = normalizeDraft({
    ...existing,
    ...input,
    id: existing?.id || input?.id || randomId(),
    createdByUid:
      existing?.createdByUid ||
      input?.createdByUid ||
      user?.uid ||
      null,
    createdByName:
      existing?.createdByName ||
      input?.createdByName ||
      user?.fullname ||
      user?.username ||
      "",
    updatedByUid: user?.uid || input?.updatedByUid || existing?.updatedByUid || null,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    revision: (existing?.revision || 0) + 1,
  });

  try {
    const saved = await putDraft(record);
    notifyDraftsChanged();
    return saved;
  } catch (error) {
    if (!isQuotaExceededError(error)) throw error;
    // Free the oldest drafts, then retry once. The just-saved draft is the
    // newest entry and is therefore never the one evicted.
    await pruneProductDrafts({ keep: 1 });
    const saved = await putDraft(record);
    notifyDraftsChanged();
    return saved;
  }
}

export async function deleteDraftImages(draftId) {
  if (!draftId) return 0;
  return withStore(
    DRAFT_IMAGES_STORE,
    "readwrite",
    async (images) => {
      const keys = await images.index("draftId").getAllKeys(draftId);
      await Promise.all(keys.map((key) => images.delete(key)));
      return keys.length;
    },
  );
}

export async function deleteProductDraft(id) {
  if (!id) return false;
  return withStore(
    [PRODUCT_DRAFTS_STORE, DRAFT_IMAGES_STORE],
    "readwrite",
    async (drafts, images) => {
      const keys = await images.index("draftId").getAllKeys(id);
      await Promise.all(keys.map((key) => images.delete(key)));
      await drafts.delete(id);
      notifyDraftsChanged();
      return true;
    },
  );
}

export async function clearProductDrafts() {
  return withStore(
    [PRODUCT_DRAFTS_STORE, DRAFT_IMAGES_STORE],
    "readwrite",
    async (drafts, images) => {
      await drafts.clear();
      await images.clear();
      notifyDraftsChanged();
      return true;
    },
  );
}

export async function pruneProductDrafts({
  keep = MAX_PRODUCT_DRAFTS,
  maxAge = MAX_DRAFT_AGE_MS,
} = {}) {
  const records = await listRaw();
  if (!records.length) return 0;

  const now = Date.now();
  const fresh = records.filter(
    (record) => now - (record.updatedAt || 0) <= maxAge,
  );
  const keepIds = new Set(fresh.slice(0, Math.max(0, keep)).map((record) => record.id));
  const stale = records.filter((record) => !keepIds.has(record.id));

  await Promise.all(stale.map((record) => deleteProductDraft(record.id)));
  return stale.length;
}

export async function saveDraftImage({
  id,
  draftId,
  blob,
  name = "",
  type = "",
  size,
  createdByUid = null,
}) {
  if (!draftId) throw new Error("A draft ID is required to store an image.");
  if (!(blob instanceof Blob)) {
    throw new Error("Draft images must be stored as Blob or File values.");
  }

  const record = {
    id: id || randomId(),
    draftId,
    blob,
    name,
    type: type || blob.type || "",
    size: Number(size) || blob.size || 0,
    createdByUid,
    createdAt: Date.now(),
  };

  try {
    return await withStore(DRAFT_IMAGES_STORE, "readwrite", async (store) => {
      await store.put(record);
      return record;
    });
  } catch (error) {
    if (!isQuotaExceededError(error)) throw error;
    await pruneProductDrafts({ keep: 1 });
    return withStore(DRAFT_IMAGES_STORE, "readwrite", async (store) => {
      await store.put(record);
      return record;
    });
  }
}

export async function loadDraftImage(id) {
  if (!id) return null;
  return withStore(DRAFT_IMAGES_STORE, "readonly", (store) => store.get(id));
}

export async function listDraftImages(draftId) {
  if (!draftId) return [];
  const records = await withStore(
    DRAFT_IMAGES_STORE,
    "readonly",
    (store) => store.index("draftId").getAll(draftId),
  );
  return Array.isArray(records)
    ? records.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    : [];
}

export async function deleteDraftImage(id) {
  if (!id) return false;
  return withStore(DRAFT_IMAGES_STORE, "readwrite", async (store) => {
    await store.delete(id);
    return true;
  });
}
