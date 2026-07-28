import { useRef } from "react";

const MAX_IMAGES = 5;

export default function ProductImageUploader({ images, onChange }) {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Product Images</h3>

        <span className="text-xs text-gray-500">
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-xl overflow-hidden border"
          >
            <img
              src={image.preview || image?.url}
              className="w-full h-full object-cover"
            />

            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white"
            >
              <i className="ri-close-line" />
            </button>
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center hover:border-[#2D6A4F]"
          >
            <i className="ri-image-add-line text-3xl text-[#2D6A4F]" />

            <span className="text-xs mt-2">Add Image</span>
          </button>
        )}
      </div>
    </div>
  );
}
