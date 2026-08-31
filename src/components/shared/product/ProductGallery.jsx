import { useRef, useState } from "react";
import ImageViewerModal from "../../common/ImageViewerModal";

export default function ProductGallery({ product }) {
  return <ProductGalleryImages key={product.id} product={product} />;
}

function ProductGalleryImages({ product }) {
  const images = product.images ?? [];
  const [selected, setSelected] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const scrollContainerRef = useRef(null);

  if (!images.length) {
    return (
      <div className="aspect-square rounded-2xl md:rounded-3xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 text-sm">
        No images available
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
    <div className="space-y-2 md:space-y-4">
      {/* Main Image / Swipeable Carousel */}
      <div className="relative aspect-square w-full sm:rounded-2xl md:rounded-3xl sm:border sm:border-gray-200 bg-black/5 overflow-hidden shadow-xs group">
        {/* Horizontal scroll snap container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none touch-pan-x"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {images.map((image, index) => (
            <div
              key={image.publicId || index}
              className="w-full h-full shrink-0 snap-center snap-always flex items-center justify-center bg-gray-50 cursor-pointer"
              onClick={() =>
                setFullscreenImage({
                  src: image.url || image,
                  title: `${product.name} (${index + 1}/${images.length})`,
                })
              }
            >
              <img
                src={image.url || image}
                alt={`${product.name} ${index + 1}`}
                loading="lazy"
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Hover zoom hint badge */}
        <button
          type="button"
          onClick={() =>
            setFullscreenImage({
              src: currentImageUrl,
              title: `${product.name} (${selected + 1}/${images.length})`,
            })
          }
          className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 backdrop-blur-xs text-white shadow-md hover:bg-black/80 cursor-pointer"
          title="Click to view full screen & zoom"
        >
          <i className="ri-zoom-in-line text-base" />
        </button>

        {/* Shopee-style bottom-right page indicator (e.g. 1/5) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-xs font-semibold tracking-wider select-none shadow-md pointer-events-none">
            {selected + 1}/{images.length}
          </div>
        )}
      </div>

      {/* Thumbnail selector on both mobile and desktop */}
      {images.length > 1 && (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto px-2 py-1 scrollbar-none md:grid md:grid-cols-5 md:overflow-visible">
          {images.map((image, index) => (
            <button
              key={image.publicId || index}
              type="button"
              onClick={() => handleThumbnailClick(index)}
              className={`shrink-0 w-20 h-20 md:w-auto md:h-auto overflow-hidden rounded sm:rounded-xl transition-all duration-200 aspect-square cursor-pointer ${
                selected === index
                  ? "border-[#2D6A4F] ring-2 ring-[#2D6A4F]/20 scale-[1.02] opacity-100"
                  : "border-gray-200 opacity-80 hover:opacity-100 hover:border-gray-300"
              }`}
            >
              <img
                src={image.url || image}
                alt=""
                loading="lazy"
                className="aspect-square w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Zoomable Image Modal */}
      <ImageViewerModal
        isOpen={Boolean(fullscreenImage)}
        src={fullscreenImage?.src}
        title={fullscreenImage?.title}
        onClose={() => setFullscreenImage(null)}
      />
    </div>
  );
}
