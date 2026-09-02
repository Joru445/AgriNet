import { useEffect, useRef, useState, useCallback } from "react";
import { compressImage } from "../../../utils/imageCompression";
import { useLanguage } from "../../../context/LanguageContext";
import MessageReplyPreview from "./MessageReplyPreview";

export default function MessageInput({
  value,
  onChange,
  onSend,
  inquiryProduct,
  onCancelInquiry,
  onSendInquiry,
  selectedImage,
  onSelectImage,
  onRemoveImage,
  uploadingImage = false,
  replyTo,
  onClearReply,
}) {
  const textareaRef = useRef(null);
  const menuRef = useRef(null);
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const { t } = useLanguage();

  const [quantity, setQuantity] = useState(1);
  const [showMenu, setShowMenu] = useState(false);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showMenu]);

  // Auto-grow textarea up to 3 lines
  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);

    const maxHeight = lineHeight * 3 + 24;

    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [value]);

  /*
   * Reset the inquiry quantity whenever
   * the selected inquiry product changes.
   */

  useEffect(() => {
    setQuantity(1);
  }, [inquiryProduct?.id]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!uploadingImage && (value.trim() || selectedImage)) {
        onSend();
        requestAnimationFrame(() => {
          textareaRef.current?.focus();
        });
      }
    }
  }

  const processAndSelectImage = useCallback(async (file) => {
    if (!file) return;

    setShowMenu(false);

    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }

    const compressed = await compressImage(file);
    const previewUrl = URL.createObjectURL(compressed);

    onSelectImage?.({
      file: compressed,
      previewUrl,
    });
  }, [selectedImage, onSelectImage]);

  function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    processAndSelectImage(file);
  }

  function handlePaste(e) {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            processAndSelectImage(file);
            return;
          }
        }
      }
    }

    const files = clipboardData.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file && file.type && file.type.startsWith("image/")) {
        e.preventDefault();
        processAndSelectImage(file);
      }
    }
  }

  useEffect(() => {
    function handleGlobalPaste(e) {
      const target = e.target;
      if (target && target.tagName === "INPUT") return;
      if (target && target.tagName === "TEXTAREA") return;

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type && item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              e.preventDefault();
              processAndSelectImage(file);
              return;
            }
          }
        }
      }
    }

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, [processAndSelectImage]);

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => {
      const currentQuantity = Number(current);

      if (!Number.isInteger(currentQuantity)) {
        return 1;
      }

      if (hasStock) {
        return Math.min(stock, currentQuantity + 1);
      }

      return currentQuantity + 1;
    });
  }

  function handleQuantityChange(e) {
    const value = e.target.value;

    if (value === "") {
      setQuantity("");
      return;
    }

    const nextQuantity = Number(value);

    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      return;
    }

    if (hasStock) {
      setQuantity(Math.min(nextQuantity, stock));

      return;
    }

    setQuantity(nextQuantity);
  }

  function handleSendInquiry() {
    const finalQuantity = Number(quantity);

    if (!Number.isInteger(finalQuantity) || finalQuantity < 1) {
      return;
    }

    onSendInquiry(finalQuantity);
  }

  const stock = Number(inquiryProduct?.stock);

  const isAvailable = inquiryProduct?.available === true;

  const hasStock = Number.isInteger(stock) && stock > 0;

  const isMaxQuantity = hasStock && Number(quantity) >= stock;

  const canSend = Boolean(value.trim() || selectedImage) && !uploadingImage;

  return (
    <div className="shrink-0 w-full border-t p-3 bg-[var(--agri-surface)] border-[var(--agri-border-subtle)] z-10">
      {/* Hidden file inputs for Camera and Gallery */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileSelected}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileSelected}
      />

      {inquiryProduct && (
        <div className="relative mb-3 rounded-2xl border border-agri-border bg-agri-bg-surface p-3">
          {onCancelInquiry && (
            <button
              type="button"
              onClick={onCancelInquiry}
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full text-[var(--agri-text-muted)] hover:text-[var(--agri-text)] transition"
              title={t("messages.cancelInquiry")}
            >
              <i className="ri-close-line text-lg" />
            </button>
          )}

          <div className="flex items-center gap-3 pr-8">
            {inquiryProduct.images?.[0] && (
              <img
                src={inquiryProduct.images[0].url}
                alt={inquiryProduct.name}
                className="h-12 w-12 shrink-0 rounded-xl object-cover"
              />
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                {t("messages.productInquiry")}
              </p>

              <p className="truncate text-sm font-semibold text-[var(--agri-text)]">
                {inquiryProduct.name}
              </p>

              {inquiryProduct.price != null && (
                <p className="text-xs text-[var(--agri-text-muted)]">
                  ₱{inquiryProduct.price}
                  {inquiryProduct.unit ? ` / ${inquiryProduct.unit}` : ""}
                </p>
              )}

              {isAvailable && hasStock && (
                <p className="mt-0.5 text-xs text-[var(--agri-text-muted)]">
                   {t("messageInput.available", { count: stock, unit: inquiryProduct.unit || "units" })}
                </p>
              )}
            </div>
          </div>

          {/* Quantity + Send */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-[var(--agri-text-secondary)]">
                 {t("messageInput.quantity")}
              </p>

              <div className="flex h-10 items-center rounded-xl border border-[var(--agri-input-border)] bg-[var(--agri-input-bg)]">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={Number(quantity) <= 1}
                  className="
                    flex h-full w-10 items-center
                    justify-center
                    text-[var(--agri-text-muted)]
                    transition
                    hover:text-[#2D6A4F] dark:hover:text-[var(--agri-brand)]
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                  aria-label={t("messageInput.decreaseQuantity")}
                >
                  <i className="ri-subtract-line" />
                </button>

                <input
                  type="number"
                  min="1"
                  max={hasStock ? stock : undefined}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="
                    h-full w-14
                    border-x border-[var(--agri-border-subtle)]
                    bg-transparent
                    text-center text-sm
                    font-semibold text-[var(--agri-text)]
                    outline-none
                  "
                  aria-label={t("messageInput.inquiryQuantity")}
                />

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={isMaxQuantity}
                  className="
                    flex h-full w-10 items-center
                    justify-center
                    text-[var(--agri-text-muted)]
                    transition
                    hover:text-[#2D6A4F] dark:hover:text-[var(--agri-brand)]
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                  aria-label={t("messageInput.increaseQuantity")}
                >
                  <i className="ri-add-line" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendInquiry}
              disabled={
                !isAvailable ||
                !hasStock ||
                !Number.isInteger(Number(quantity)) ||
                Number(quantity) < 1
              }
              className="
                shrink-0 rounded-xl
                bg-[#2D6A4F]
                px-4 py-2.5
                text-sm font-medium text-white
                transition
                hover:bg-[#1B4332]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {!isAvailable ? t("messageInput.unavailable") : t("messageInput.sendInquiry")}
            </button>
          </div>
        </div>
      )}

      {/* Main Input Container - High Contrast and Clear Readability */}
      <div className="relative flex flex-col w-full rounded-2xl border-2 bg-[var(--agri-card)] border-[var(--agri-input-border)] shadow-xs focus-within:border-[#2D6A4F] focus-within:ring-2 focus-within:ring-[#2D6A4F]/20 transition-all duration-150">
        {/* Reply Preview */}
        {replyTo && (
          <div className="p-2.5 pb-1">
            <MessageReplyPreview replyTo={replyTo} onClear={onClearReply} />
          </div>
        )}

        {/* Selected Image Preview */}
        {selectedImage?.previewUrl && (
          <div className="p-3 pb-1 flex items-center gap-3 border-b border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 rounded-t-2xl">
            <div className="relative inline-block">
              <img
                src={selectedImage.previewUrl}
                 alt={t("messageInput.selectedPreview")}
                className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-xl border-2 border-[#2D6A4F] shadow-sm"
              />
              {uploadingImage ? (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center text-white">
                  <i className="ri-loader-4-line text-2xl animate-spin" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (selectedImage?.previewUrl) {
                      URL.revokeObjectURL(selectedImage.previewUrl);
                    }

                    if (galleryInputRef.current) {
                      galleryInputRef.current.value = "";
                    }

                    if (cameraInputRef.current) {
                      cameraInputRef.current.value = "";
                    }

                    onRemoveImage?.();
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md transition cursor-pointer"
                  title={t("messageInput.removeImage")}
                >
                  <i className="ri-close-line text-xs font-bold" />
                </button>
              )}
            </div>

            <div className="text-xs text-[var(--agri-text-secondary)]">
              <p className="font-semibold text-[var(--agri-text)] flex items-center gap-1">
                 <i className="ri-image-fill text-[#2D6A4F] dark:text-[var(--agri-brand)]" /> {t("messageInput.photoSelected")}
              </p>
              <p className="text-[var(--agri-text-muted)] mt-0.5">
                {uploadingImage
                   ? t("messageInput.uploadingPhoto")
                   : t("messageInput.typeCaption")}
              </p>
            </div>
          </div>
        )}

        <div className="flex w-full items-end">
          {/* + Attachment Button with Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              aria-label={t("messageInput.addAttachment")}
              title={t("messageInput.addPhotoMedia")}
              className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-[#2D6A4F] dark:text-[var(--agri-brand)] transition hover:text-[#1B4332] dark:hover:text-[var(--agri-brand-light)] hover:bg-black/5 cursor-pointer ${
                showMenu ? "rotate-45" : "rotate-0"
              }`}
            >
              <i className="ri-add-large-fill text-lg font-bold transition-transform duration-200" />
            </button>

            {/* Menu Popover */}
            {showMenu && (
              <div className="absolute bottom-14 left-0 z-50 w-52 bg-[var(--agri-card)] rounded-2xl shadow-xl border border-[var(--agri-border)] p-1.5 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    cameraInputRef.current?.click();
                  }}
                  className="flex sm:hidden items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold text-[var(--agri-text-secondary)] hover:bg-[#2D6A4F]/10 hover:text-[#2D6A4F] dark:hover:text-[var(--agri-brand)] transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[var(--agri-brand)] flex items-center justify-center shrink-0">
                    <i className="ri-camera-fill text-base" />
                  </div>
                   <span>{t("messageInput.takePhoto")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    galleryInputRef.current?.click();
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold text-[var(--agri-text-secondary)] hover:bg-[#2D6A4F]/10 hover:text-[#2D6A4F] dark:hover:text-[var(--agri-brand)] transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[var(--agri-brand)] flex items-center justify-center shrink-0">
                    <i className="ri-image-2-fill text-base" />
                  </div>
                   <span>{t("messageInput.chooseFromGallery")}</span>
                </button>
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
               selectedImage
                ? t("messageInput.captionPlaceholder")
                : t("messageInput.messagePlaceholder")
            }
            className="min-w-0 flex-1 resize-none overflow-y-auto py-3 focus:outline-none bg-transparent text-sm sm:text-base font-semibold text-[var(--agri-text)] placeholder-[var(--agri-text-muted)]"
          />

          <button
            type="button"
            onClick={() => {
              if (canSend) {
                onSend();
                requestAnimationFrame(() => {
                  textareaRef.current?.focus();
                });
              }
            }}
            disabled={!canSend}
            aria-label={t("messageInput.sendMessage")}
            className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center transition ${
              canSend
                ? "text-[#2D6A4F] dark:text-[var(--agri-brand)] hover:text-[#1B4332] dark:hover:text-[var(--agri-brand-light)] hover:bg-[#2D6A4F]/10 cursor-pointer hover:scale-105 active:scale-95"
                : "text-[var(--agri-border)] cursor-not-allowed"
            }`}
          >
            {uploadingImage ? (
              <i className="ri-loader-4-line text-xl animate-spin text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
            ) : (
              <i className="ri-send-plane-fill text-xl" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
