import { useRef } from "react";

import { useLanguage } from "../../../context/LanguageContext";

const MAX_IMAGES = 5;

export default function ProductImageUploader({ images, onChange }) {
  const { t } = useLanguage();
  const inputRef = useRef(null);

  function handleFiles(e) {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    const next = [
      ...images,
      ...files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ].slice(0, MAX_IMAGES);

    onChange(next);
  }

  function removeImage(index) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-bold text-[var(--agri-text)] flex items-center gap-1.5">
            <i className="ri-image-line text-[#2D6A4F] dark:text-[var(--agri-brand)] text-base" />
            <span>{t("products.productImages")}</span>
            <span className="text-red-500">*</span>
          </label>
          <p className="text-[11px] text-[var(--agri-text-muted)] mt-0.5">
            PNG, JPG, WebP up to 5MB
          </p>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-secondary)] border border-gray-300 dark:border-gray-600">
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
        {images.map((image, index) => (
          <div
            key={index}
            className="group relative aspect-square rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 bg-[var(--agri-card)] shadow-xs"
          >
            <img
              src={image.preview || image?.url}
              alt="Product preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

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
        ))}

        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#2D6A4F] dark:hover:border-[var(--agri-brand)] bg-[var(--agri-hover)]/30 hover:bg-[#E8F5EE]/40 dark:hover:bg-[var(--agri-brand-bg-alt)]/40 rounded-xl flex flex-col items-center justify-center p-2.5 transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-[var(--agri-card)] flex items-center justify-center shadow-xs border border-gray-300 dark:border-gray-600 group-hover:scale-110 group-hover:border-[#2D6A4F] transition-all mb-1.5">
              <i className="ri-image-add-line text-lg text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
            </div>

            <span className="text-xs font-semibold text-[var(--agri-text)] group-hover:text-[#2D6A4F] dark:group-hover:text-[var(--agri-brand)] transition-colors">
              {t("products.addImage")}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
