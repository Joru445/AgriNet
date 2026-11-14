import { useEffect, useRef, useState } from "react";

import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import { compressImage } from "../../../utils/imageCompression";
import {
  deleteDraftImage,
  loadDraftImage,
  saveDraftImage,
} from "../../../utils/persistence/productDraftStore";

const MAX_IMAGES = 5;

function newImageId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `img_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function ProductImageUploader({
  images,
  onChange,
  draftId,
}) {
  const { t } = useLanguage();
  const { account, identity } = useAuth();
  const user = account || identity || null;
  const inputRef = useRef(null);
  const previewUrlsRef = useRef(new Map());
  const [draftPreviews, setDraftPreviews] = useState({});

  // Materialize preview URLs for images restored from IndexedDB. Object URLs
  // must be recreated after a reload because blob: URLs never survive it.
  useEffect(() => {
    let cancelled = false;

    images.forEach(async (image) => {
      if (image?.kind !== "draft" || !image.id) return;
      if (previewUrlsRef.current.has(image.id)) return;

      try {
        const record = await loadDraftImage(image.id);
        if (cancelled || !record?.blob) return;
        const url = URL.createObjectURL(record.blob);
        previewUrlsRef.current.set(image.id, url);
        setDraftPreviews((previous) => ({ ...previous, [image.id]: url }));
      } catch (error) {
        console.warn("[product-draft] Unable to restore draft image:", error);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [images]);

  useEffect(
    () => () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    },
    [],
  );

  async function handleFiles(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const remaining = Math.max(0, MAX_IMAGES - images.length);
    const selected = files.slice(0, remaining);
    const added = [];

    for (const file of selected) {
      const fallbackPreview = URL.createObjectURL(file);
      let descriptor;
      let persistedId = null;

      try {
        const compressed = await compressImage(file);
        const id = newImageId();
        const url = URL.createObjectURL(compressed);
        previewUrlsRef.current.set(id, url);
        persistedId = id;

        await saveDraftImage({
          id,
          draftId,
          blob: compressed,
          name: compressed.name || file.name,
          type: compressed.type || file.type,
          size: compressed.size,
          createdByUid: user?.uid || null,
        });

        URL.revokeObjectURL(fallbackPreview);
        descriptor = { id, kind: "draft" };
      } catch (error) {
        console.warn("[product-draft] Unable to persist image locally:", error);
        if (persistedId) {
          const previewUrl = previewUrlsRef.current.get(persistedId);
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          previewUrlsRef.current.delete(persistedId);
        }
        descriptor = { file, preview: fallbackPreview };
      }

      added.push(descriptor);
    }

    onChange([...images, ...added]);
    event.target.value = "";
  }

  function removeImage(index) {
    const image = images[index];

    if (image?.id && previewUrlsRef.current.has(image.id)) {
      URL.revokeObjectURL(previewUrlsRef.current.get(image.id));
      previewUrlsRef.current.delete(image.id);
    }

    if (image?.kind === "draft" && image.id) {
      deleteDraftImage(image.id).catch(() => {});
      setDraftPreviews((previous) => {
        const next = { ...previous };
        delete next[image.id];
        return next;
      });
    }

    onChange(images.filter((_, imageIndex) => imageIndex !== index));
  }

  function previewFor(image) {
    if (image?.preview) return image.preview;
    if (image?.kind === "existing") return image.url;
    if (image?.kind === "draft") return draftPreviews[image.id] || "";
    return image?.url || "";
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-bold text-(--agri-text) flex items-center gap-1.5">
            <i className="ri-image-line text-[#2D6A4F] dark:text-(--agri-brand) text-base" />
            <span>{t("products.productImages")}</span>
            <span className="text-red-500">*</span>
          </label>
          <p className="text-[11px] text-(--agri-text-muted) mt-0.5">
            PNG, JPG, WebP up to 5MB
          </p>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-(--agri-hover) text-(--agri-text-secondary) border border-gray-300 dark:border-gray-600">
          {images.length}/{MAX_IMAGES}
        </span>
      </div>

      <input
        ref={inputRef}
        hidden
        multiple
        type="file"
        accept="image/*"
        onChange={handleFiles}
      />

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {images.map((image, index) => {
          const preview = previewFor(image);

          return (
            <div
              key={image.id || image.url || index}
              className="group relative aspect-square rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 bg-(--agri-card) shadow-xs"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Product preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-(--agri-text-muted)">
                  <i className="ri-loader-4-line animate-spin text-xl" />
                </div>
              )}

              {index === 0 && (
                <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                  Main
                </span>
              )}

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-black/60 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
                title={t("common.delete")}
              >
                <i className="ri-close-line text-sm" />
              </button>
            </div>
          );
        })}

        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#2D6A4F] dark:hover:border-(--agri-brand) bg-(--agri-hover)/30 hover:bg-[#E8F5EE]/40 dark:hover:bg-(--agri-brand-bg-alt)/40 rounded-xl flex flex-col items-center justify-center p-2.5 transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-(--agri-card) flex items-center justify-center shadow-xs border border-gray-300 dark:border-gray-600 group-hover:scale-110 group-hover:border-[#2D6A4F] transition-all mb-1.5">
              <i className="ri-image-add-line text-lg text-[#2D6A4F] dark:text-(--agri-brand)" />
            </div>

            <span className="text-xs font-semibold text-(--agri-text) group-hover:text-[#2D6A4F] dark:group-hover:text-(--agri-brand) transition-colors">
              {t("products.addImage")}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
