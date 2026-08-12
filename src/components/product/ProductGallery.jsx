import { useState } from "react";

export default function ProductGallery({ product }) {
  return <ProductGalleryImages key={product.id} product={product} />;
}

function ProductGalleryImages({ product }) {
  const images = product.images ?? [];

  const [selected, setSelected] = useState(0);

  const selectedImage = images[selected];

  if (!images.length) {
    return (
      <div className="aspect-square rounded-3xl border flex items-center justify-center text-gray-500">
        No images available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <img
        src={selectedImage?.url}
        alt={product.name}
        className="aspect-square w-full rounded-3xl border object-cover"
      />

      <div className="grid grid-cols-5 gap-3">
        {images.map((image, index) => (
          <button
            key={image.publicId}
            onClick={() => setSelected(index)}
            className={`overflow-hidden rounded-xl border-2 ${
              selected === index ? "border-[#2D6A4F]" : "border-transparent"
            }`}
          >
            <img
              src={image.url}
              alt=""
              className="aspect-square w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
