import { useEffect, useRef, useState, useCallback, useMemo, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { compressImage } from "../../utils/imageCompression";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getProductInquiryState } from "../../utils/productStatus";
import Button from "../ui/Button";
import useClickOutside from "../../hooks/useClickOutside";
import MessageReplyPreview from "./MessageReplyPreview";

const ShareLocationModal = lazy(() => import("./ShareLocationModal"));

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
  isSending = false,
  replyTo,
  onClearReply,
  onSendLocation,
  onStopLiveLocation,
  hasActiveLiveLocation = false,
  activeLiveMessageId = null,
}) {
  const { identity, profile } = useAuth();
  const isAdmin = (identity?.role || profile?.role) === "admin";

  const textareaRef = useRef(null);
  const plusButtonRef = useRef(null);
  const menuRef = useRef(null);
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const { t } = useLanguage();

  const [quantity, setQuantity] = useState(1);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Helper to compute portal menu position safely relative to plus button
  const computeMenuPos = useCallback(() => {
    const btn = plusButtonRef.current;
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    const menuWidth = 208; // w-52 is 13rem = 208px
    const safeLeft = Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8));
    const safeBottom = Math.max(8, window.innerHeight - rect.top + 6);
    return { left: safeLeft, bottom: safeBottom };
  }, []);

  // Close menu on click outside (ignoring clicks inside the menu itself and
  // on the plus button that toggles it)
  const menuDismissRefs = useMemo(() => [menuRef, plusButtonRef], []);
  useClickOutside(
    menuDismissRefs,
    () => setShowMenu(false),
    showMenu,
  );

  // Keep menu positioned accurately if screen resizes
  useEffect(() => {
    if (!showMenu) return;

    function handleResizeOrScroll() {
      const pos = computeMenuPos();
      if (pos) setMenuPos(pos);
    }

    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);

    return () => {
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
    };
  }, [showMenu, computeMenuPos]);

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

  // Time-derived eligibility (pre-order deadline) must stay current even if
  // the composer sits open — periodically recompute so the disabled state
  // and reason update without a user interaction. The final authoritative
  // re-check happens on click (handleSendInquiry) plus a fresh product fetch
  // inside useInquiryFlow.sendInquiry.
  const [stateNow, setStateNow] = useState(() => Date.now());
  useEffect(() => {
    if (!inquiryProduct?.id) return;
    const timer = setInterval(() => setStateNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, [inquiryProduct?.id]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
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

      if (canReserve) {
        return Math.min(maxQuantity, currentQuantity + 1);
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

    if (canReserve) {
      setQuantity(Math.min(nextQuantity, maxQuantity));

      return;
    }

    setQuantity(nextQuantity);
  }

  function handleSendInquiry() {
    const finalQuantity = Number(quantity);

    if (!Number.isInteger(finalQuantity) || finalQuantity < 1) {
      return;
    }

    // Re-evaluate eligibility against the CURRENT time immediately before
    // handing off — the deadline may have passed since the last render.
    // Server-side product data freshness is re-checked in useInquiryFlow.
    const freshState = inquiryProduct
      ? getProductInquiryState(inquiryProduct)
      : null;
    if (
      !freshState?.allowed ||
      finalQuantity > freshState.quantityAvailable
    ) {
      setStateNow(Date.now());
      return;
    }

    onSendInquiry(finalQuantity);
  }

  const inquiryState = inquiryProduct
    ? getProductInquiryState(inquiryProduct, stateNow)
    : null;
  const canReserve = Boolean(inquiryState?.allowed);
  const isPreorder = inquiryProduct?.sellingMode === "preorder";
  const maxQuantity = inquiryState?.quantityAvailable ?? 0;
  const parsedQty = Number(quantity);
  const isMaxQuantity = canReserve && parsedQty >= maxQuantity;

  const canSend = Boolean(value.trim() || selectedImage) && !uploadingImage && !isSending;

  return (
    <div className="shrink-0 w-full bg-transparent p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:border-t border-(--agri-border-subtle) z-10">
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
        <div className="relative mb-3 rounded-2xl border border-(--agri-border) bg-(--agri-card) p-3">
          {onCancelInquiry && (
            <button
              type="button"
              onClick={onCancelInquiry}
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full text-(--agri-text-muted) hover:text-(--agri-text) transition"
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
              <p className="text-xs font-medium text-[#2D6A4F] dark:text-(--agri-brand)">
                {t("messages.productInquiry")}
              </p>

              <p className="truncate text-sm font-semibold text-(--agri-text)">
                {inquiryProduct.name}
              </p>

              {inquiryProduct.price != null && (
                <p className="text-xs text-(--agri-text-muted)">
                  ₱{inquiryProduct.price}
                  {inquiryProduct.unit ? ` / ${inquiryProduct.unit}` : ""}
                </p>
              )}

              {canReserve && !isPreorder && (
                <p className="mt-0.5 text-xs text-(--agri-text-muted)">
                  {t("messageInput.available", { count: maxQuantity, unit: inquiryProduct.unit || "units" })}
                </p>
              )}
              {canReserve && isPreorder && (
                <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {t("messageInput.preOrderAvailable", { count: maxQuantity, unit: inquiryProduct.unit || "units" })}
                </p>
              )}
              {!canReserve && inquiryState && (
                <p className="mt-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                  {t(inquiryState.reasonKey)}
                </p>
              )}
            </div>
          </div>

          {/* Quantity + Send */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex h-10 items-center rounded-xl border border-(--agri-input-border)] bg-(--agri-input-bg)">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={Number(quantity) <= 1}
                  className="
                    flex h-full w-10 items-center
                    justify-center
                    text-(--agri-text-muted)
                    transition
                    hover:text-[#2D6A4F] dark:hover:text-(--agri-brand)
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
                  max={canReserve ? maxQuantity : undefined}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="
                    h-full w-14
                    border-x border-(--agri-border-subtle)
                    bg-transparent
                    text-center text-sm
                    font-semibold text-(--agri-text)
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
                    text-(--agri-text-muted)
                    transition
                    hover:text-[#2D6A4F] dark:hover:text-(--agri-brand)
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                  aria-label={t("messageInput.increaseQuantity")}
                >
                  <i className="ri-add-line" />
                </button>
              </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSendInquiry}
              disabled={
                !canReserve ||
                !Number.isInteger(Number(quantity)) ||
                Number(quantity) < 1 ||
                Number(quantity) > maxQuantity
              }
              className="shrink-0 rounded-xl"
            >
              {!canReserve
                ? t(inquiryState.labelKey)
                : t(inquiryState.ctaKey)}
            </Button>
          </div>
        </div>
      )}

      {/* Main Input Container */}
      <div className="relative flex flex-col w-full rounded-2xl border-2 bg-transparent border-(--agri-input-border) shadow-xs focus-within:border-[#2D6A4F] focus-within:ring-2 focus-within:ring-[#2D6A4F]/20 transition-all duration-150">
        {/* Reply Preview */}
        {replyTo && (
          <div className="p-2.5 pb-1">
            <MessageReplyPreview replyTo={replyTo} onClear={onClearReply} />
          </div>
        )}

        {/* Selected Image Preview */}
        {selectedImage?.previewUrl && (
          <div className="p-3 pb-1 flex items-center gap-3 border-b border-(--agri-border-subtle) bg-(--agri-hover)/50 rounded-t-2xl">
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

            <div className="text-xs text-(--agri-text-secondary)">
              <p className="font-semibold text-(--agri-text) flex items-center gap-1">
                 <i className="ri-image-fill text-[#2D6A4F] dark:text-(--agri-brand)" /> {t("messageInput.photoSelected")}
              </p>
              <p className="text-(--agri-text-muted) mt-0.5">
                {uploadingImage
                   ? t("messageInput.uploadingPhoto")
                   : t("messageInput.typeCaption")}
              </p>
            </div>
          </div>
        )}

        <div className="flex w-full items-end">
          {/* + Attachment Button with Menu */}
          <div className="relative">
            <button
              ref={plusButtonRef}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (showMenu) {
                  setShowMenu(false);
                } else {
                  const pos = computeMenuPos();
                  if (pos) setMenuPos(pos);
                  setShowMenu(true);
                }
              }}
              aria-label={t("messageInput.addAttachment")}
              title={t("messageInput.addPhotoMedia")}
              className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-[#2D6A4F] dark:text-(--agri-brand) transition hover:text-[#1B4332] dark:hover:text-(--agri-brand-light) hover:bg-black/5 cursor-pointer active:scale-95 ${
                showMenu ? "rotate-45" : "rotate-0"
              }`}
            >
              <i className="ri-add-large-fill text-lg font-bold transition-transform duration-200" />
            </button>

            {/* Menu Popover - rendered via portal to escape overflow-hidden */}
            {showMenu && menuPos && createPortal(
              <div
                ref={menuRef}
                className="fixed z-[99999] w-52 bg-(--agri-card) rounded-2xl shadow-xl border border-(--agri-border) p-1.5 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-150"
                style={{ left: menuPos.left, bottom: menuPos.bottom }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    cameraInputRef.current?.click();
                  }}
                  className="flex sm:hidden items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold text-(--agri-text-secondary) hover:bg-[#2D6A4F]/10 hover:text-[#2D6A4F] dark:hover:text-(--agri-brand) transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-(--agri-brand) flex items-center justify-center shrink-0">
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
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold text-(--agri-text-secondary) hover:bg-[#2D6A4F]/10 hover:text-[#2D6A4F] dark:hover:text-(--agri-brand) transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-(--agri-brand) flex items-center justify-center shrink-0">
                    <i className="ri-image-2-fill text-base" />
                  </div>
                   <span>{t("messageInput.chooseFromGallery")}</span>
                </button>

                {!isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowLocationModal(true);
                    }}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold text-(--agri-text-secondary) hover:bg-[#2D6A4F]/10 hover:text-[#2D6A4F] dark:hover:text-(--agri-brand) transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <i className="ri-map-pin-2-fill text-base" />
                    </div>
                    <span>{t("messages.shareLocation")}</span>
                  </button>
                )}
              </div>,
              document.body,
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
            className="min-w-0 flex-1 resize-none overflow-y-auto py-3 focus:outline-none bg-transparent text-sm sm:text-base font-semibold text-(--agri-text) placeholder-(--agri-text-muted)"
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
                ? "text-[#2D6A4F] dark:text-(--agri-brand) hover:text-[#1B4332] dark:hover:text-(--agri-brand-light) hover:bg-[#2D6A4F]/10 cursor-pointer hover:scale-105 active:scale-95"
                : "text-(--agri-border) cursor-not-allowed"
            }`}
          >
            {uploadingImage || isSending ? (
              <i className="ri-loader-4-line text-xl animate-spin text-[#2D6A4F] dark:text-(--agri-brand)" />
            ) : (
              <i className="ri-send-plane-fill text-xl" />
            )}
          </button>
        </div>
      </div>

      {showLocationModal && !isAdmin && (
        <Suspense fallback={null}>
          <ShareLocationModal
            isOpen={showLocationModal}
            onClose={() => setShowLocationModal(false)}
            onSendLocation={onSendLocation}
            onStopLiveLocation={onStopLiveLocation}
            hasActiveLiveLocation={hasActiveLiveLocation}
            activeLiveMessageId={activeLiveMessageId}
          />
        </Suspense>
      )}
    </div>
  );
}
