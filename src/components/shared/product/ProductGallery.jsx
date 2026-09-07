import { useRef, useState } from "react";
import ImageViewerModal from "../../common/ImageViewerModal";
import { applyTransform, PRODUCT_GALLERY_TF, PRODUCT_THUMB_TF, isCloudinaryUrl } from "../../../utils/cloudinaryTransform";
import { useLanguage } from "../../../context/LanguageContext";

export default function ProductGallery({ product }) {
  return <ProductGalleryImages key={product.id} product={product} />;
}

function ProductGalleryImages({ product }) {
  const { t } = useLanguage();
  const images = product.images ?? [];
  const [selected, setSelected] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const scrollContainerRef = useRef(null);

  if (!images.length) {
    return (
      <div className="aspect-square w-full bg-[var(--agri-hover)] flex items-center justify-center text-[var(--agri-text-muted)] text-sm">
        {t("productDetails.noImages")}
      </div>
    );
  }

  const handleScroll = (e) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== selected && newIndex >= 0 && newIndex < images.length) {
        setSelected(newIndex);
      }
    }
  };

  const handleThumbnailClick = (index) => {
    setSelected(index);
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: index * width,
        behavior: "smooth",
      });
    }
  };

  const currentImageUrl = images[selected]?.url || images[selected];

  return (
    <>
      {/* Mobile: scrollable square carousel */}
      <div className="lg:hidden relative aspect-square w-full bg-black/5 overflow-hidden group">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none touch-pan-x"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {images.map((image, index) => {
            const rawSrc = image.url || image;
            const imgSrc = isCloudinaryUrl(rawSrc)
              ? applyTransform(rawSrc, PRODUCT_GALLERY_TF)
              : rawSrc;
            return (
              <div
                key={image.publicId || index}
                className="w-full h-full shrink-0 snap-center snap-always flex items-center justify-center bg-[var(--agri-hover)] cursor-pointer"
                onClick={() =>
                  setFullscreenImage({
                    src: imgSrc,
                    title: `${product.name} (${index + 1}/${images.length})`,
                  })
                }
              >
                <img
                  src={imgSrc}
                  alt={`${product.name} ${index + 1}`}
                  width={600}
                  height={600}
                  loading="lazy"
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
        <MobileOverlay
          images={images}
          selected={selected}
          product={product}
          currentImageUrl={currentImageUrl}
          onFullscreen={setFullscreenImage}
          t={t}
        />
      </div>

      {/* Desktop: image + thumbnails in a square */}
      <div className="hidden lg:flex aspect-square w-full bg-black/5 flex-col overflow-hidden">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex flex-1 min-h-0 overflow-x-auto snap-x snap-mandatory scrollbar-none touch-pan-x"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {images.map((image, index) => {
            const rawSrc = image.url || image;
            const imgSrc = isCloudinaryUrl(rawSrc)
              ? applyTransform(rawSrc, PRODUCT_GALLERY_TF)
              : rawSrc;
            return (
              <div
                key={image.publicId || index}
                className="w-full h-full shrink-0 snap-center snap-always flex items-center justify-center bg-[var(--agri-hover)] cursor-pointer"
                onClick={() =>
                  setFullscreenImage({
                    src: imgSrc,
                    title: `${product.name} (${index + 1}/${images.length})`,
                  })
                }
              >
                <img
                  src={imgSrc}
                  alt={`${product.name} ${index + 1}`}
                  width={600}
                  height={600}
                  loading="lazy"
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
        <DesktopOverlay
          images={images}
          selected={selected}
          product={product}
          currentImageUrl={currentImageUrl}
          onFullscreen={setFullscreenImage}
          onThumbnailClick={handleThumbnailClick}
          t={t}
        />
      </div>

      <ImageViewerModal
        isOpen={Boolean(fullscreenImage)}
        src={fullscreenImage?.src}
        title={fullscreenImage?.title}
        onClose={() => setFullscreenImage(null)}
      />
    </>
  );
}

function MobileOverlay({ images, selected, product, currentImageUrl, onFullscreen, t }) {
  return (
    <>
      <button
        type="button"
        onClick={() =>
          onFullscreen({
            src: currentImageUrl,
            title: `${product.name} (${selected + 1}/${images.length})`,
          })
        }
        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 backdrop-blur-xs text-white shadow-md hover:bg-black/80 cursor-pointer"
        title={t("productDetails.viewFullscreen")}
      >
        <i className="ri-zoom-in-line text-base" />
      </button>
      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-xs font-semibold tracking-wider select-none shadow-md pointer-events-none">
          {selected + 1}/{images.length}
        </div>
      )}
    </>
  );
}

function DesktopOverlay({ images, selected, product, currentImageUrl, onFullscreen, onThumbnailClick, t }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 shrink-0">
      {images.map((image, index) => {
        const rawSrc = image.url || image;
        const thumbSrc = isCloudinaryUrl(rawSrc)
          ? applyTransform(rawSrc, PRODUCT_THUMB_TF)
          : rawSrc;
        return (
          <button
            key={image.publicId || index}
            type="button"
            onClick={() => onThumbnailClick(index)}
            className={`shrink-0 w-12 h-12 overflow-hidden rounded-lg transition-all duration-200 cursor-pointer ${
              selected === index
                ? "border-2 border-[#2D6A4F] ring-1 ring-[#2D6A4F]/20 opacity-100"
                : "border border-[var(--agri-border)] opacity-60 hover:opacity-100"
            }`}
          >
            <img
              src={thumbSrc}
              alt=""
              width={48}
              height={48}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </button>
        );
      })}
      <div className="ml-auto flex items-center gap-2">
        {images.length > 1 && (
          <span className="text-xs font-semibold text-[var(--agri-text-muted)]">
            {selected + 1}/{images.length}
          </span>
        )}
        <button
          type="button"
          onClick={() =>
            onFullscreen({
              src: currentImageUrl,
              title: `${product.name} (${selected + 1}/${images.length})`,
            })
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--agri-hover)] text-[var(--agri-text-muted)] hover:bg-[var(--agri-border)] hover:text-[var(--agri-text)] transition-colors cursor-pointer"
          title={t("productDetails.viewFullscreen")}
        >
          <i className="ri-zoom-in-line text-sm" />
        </button>
      </div>
    </div>
  );
}
