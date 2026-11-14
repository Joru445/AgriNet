import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "../context/AuthContext";
import {
  createDraftId,
  deleteProductDraft,
  getDraftForProduct,
  getLatestCreateDraft,
  getProductDraft,
  saveProductDraft,
} from "../utils/persistence/productDraftStore";

const AUTOSAVE_DELAY_MS = 600;

function snapshotKey(snapshot) {
  if (!snapshot) return "";
  try {
    return JSON.stringify({
      form: snapshot.form || {},
      images: (snapshot.images || []).map((image) => ({
        id: image.id,
        kind: image.kind,
        url: image.kind === "existing" ? image.url : undefined,
      })),
      step: snapshot.step || 1,
    });
  } catch {
    return "";
  }
}

/**
 * Device-wide product draft autosave.
 *
 * Drafts are intentionally not scoped by Firebase UID. Any signed-in farmer
 * on this device can list and resume them. The active account is recorded as
 * created/updated metadata only; the backend still assigns product ownership
 * from the authenticated token at publish time.
 */
export default function useProductDraft({ draftId, productId, enabled = true }) {
  const { account, identity } = useAuth();
  const user = account || identity || null;

  const [activeDraftId, setActiveDraftId] = useState(
    () => draftId || createDraftId(),
  );
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [status, setStatus] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [restored, setRestored] = useState(false);

  const activeDraftIdRef = useRef(activeDraftId);
  const userRef = useRef(user);
  const initializedRef = useRef(false);
  const pendingRef = useRef(null);
  const timerRef = useRef(null);
  const saveChainRef = useRef(Promise.resolve());
  const lastSavedKeyRef = useRef("");
  const mountedRef = useRef(true);
  const discardTokenRef = useRef(0);

  useEffect(() => {
    activeDraftIdRef.current = activeDraftId;
  }, [activeDraftId]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      // Best-effort flush. IndexedDB writes may not finish during a hard
      // process kill, but normal close/visibility transitions flush earlier.
      const pending = pendingRef.current;
      if (pending && initializedRef.current) {
        saveChainRef.current = saveChainRef.current
          .catch(() => {})
          .then(() => {
            const id = activeDraftIdRef.current;
            return saveProductDraft(
              { id, productId, ...pending },
              userRef.current,
            );
          })
          .catch(() => {});
      }
    };
    // The unmount flush intentionally uses refs only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      initializedRef.current = true;
      return;
    }

    let cancelled = false;
    initializedRef.current = false;
    setLoading(true);
    setRestored(false);

    async function load() {
      let found = null;
      try {
        if (draftId) found = await getProductDraft(draftId);
        else if (productId) found = await getDraftForProduct(productId);
        else found = await getLatestCreateDraft();
      } catch (error) {
        console.warn("[product-draft] Unable to load draft:", error);
      }

      if (cancelled) return;

      if (found) {
        setDraft(found);
        setActiveDraftId(found.id);
        activeDraftIdRef.current = found.id;
        setLastSavedAt(found.updatedAt || null);
        setStatus("restored");
        setRestored(true);
        lastSavedKeyRef.current = snapshotKey(found);
      } else {
        setDraft(null);
        setStatus("idle");
        setLastSavedAt(null);
        lastSavedKeyRef.current = "";
      }

      setLoading(false);
      initializedRef.current = true;
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [draftId, productId, enabled]);

  const persist = useCallback(
    (snapshot) => {
      if (!snapshot || !enabled) return Promise.resolve(null);
      const key = snapshotKey(snapshot);
      if (key && key === lastSavedKeyRef.current) {
        if (pendingRef.current === snapshot) pendingRef.current = null;
        return Promise.resolve(null);
      }

      saveChainRef.current = saveChainRef.current
        .catch(() => {})
        .then(async () => {
          if (!mountedRef.current) return null;
          const token = discardTokenRef.current;
          setStatus("saving");
          try {
            const saved = await saveProductDraft(
              {
                id: activeDraftIdRef.current,
                productId: productId || null,
                ...snapshot,
              },
              userRef.current,
            );
            if (!saved) {
              if (mountedRef.current) setStatus("unavailable");
              return null;
            }
            if (token !== discardTokenRef.current) {
              // The draft was discarded or published while this write was in
              // flight. Remove the resurrected record instead of showing it.
              await deleteProductDraft(saved.id).catch(() => {});
              return null;
            }
            if (pendingRef.current === snapshot) pendingRef.current = null;
            if (mountedRef.current) {
              setDraft(saved);
              setLastSavedAt(saved.updatedAt || Date.now());
              setStatus("saved");
            }
            lastSavedKeyRef.current = key;
            return saved;
          } catch (error) {
            console.warn("[product-draft] Autosave failed:", error);
            if (mountedRef.current) setStatus("error");
            return null;
          }
        });

      return saveChainRef.current;
    },
    [enabled, productId],
  );

  const scheduleSave = useCallback(
    (snapshot) => {
      if (!enabled || !initializedRef.current) return;
      pendingRef.current = snapshot;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const pending = pendingRef.current;
        if (pending) persist(pending);
      }, AUTOSAVE_DELAY_MS);
    },
    [enabled, persist],
  );

  const flush = useCallback(
    (snapshot) => {
      if (!enabled) return Promise.resolve(null);
      if (snapshot) pendingRef.current = snapshot;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return persist(pendingRef.current);
    },
    [enabled, persist],
  );

  const pauseAutosave = useCallback(() => {
    discardTokenRef.current += 1;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingRef.current = null;
  }, []);

  const discard = useCallback(async () => {
    discardTokenRef.current += 1;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingRef.current = null;
    initializedRef.current = false;
    lastSavedKeyRef.current = "";

    try {
      await deleteProductDraft(activeDraftIdRef.current);
    } catch (error) {
      console.warn("[product-draft] Unable to discard draft:", error);
    }

    if (!mountedRef.current) return;
    setDraft(null);
    setStatus("idle");
    setLastSavedAt(null);
    setRestored(false);
    initializedRef.current = true;
  }, []);

  const dismissRestored = useCallback(() => setRestored(false), []);

  // Flush pending edits when the page is backgrounded or closed.
  useEffect(() => {
    if (!enabled) return undefined;

    const flushPending = () => {
      if (!pendingRef.current) return;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      persist(pendingRef.current);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushPending();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", flushPending);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", flushPending);
    };
  }, [enabled, persist]);

  return {
    activeDraftId,
    draft,
    loading,
    status,
    lastSavedAt,
    restored,
    scheduleSave,
    flush,
    pauseAutosave,
    discard,
    dismissRestored,
  };
}
