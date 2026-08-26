/**
 * Utility to compress images before uploading in messages.
 * Uses HTML5 Canvas to scale down dimensions and reduce file size
 * while maintaining high visual quality.
 */

export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.8,
  } = options;

  if (!file || !(file instanceof Blob)) {
    return file;
  }

  // If not an image or is a GIF/SVG (where canvas rasterization loses animation or vector quality), return original
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  // If already under 150KB, no need to compress further
  if (file.size <= 150 * 1024) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file).catch(() => null);

    let width = 0;
    let height = 0;
    let source = null;

    if (bitmap) {
      width = bitmap.width;
      height = bitmap.height;
      source = bitmap;
    } else {
      // Fallback to Image element if createImageBitmap is unavailable or fails
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(file);
        image.onload = () => {
          URL.revokeObjectURL(url);
          resolve(image);
        };
        image.onerror = (err) => {
          URL.revokeObjectURL(url);
          reject(err);
        };
        image.src = url;
      });
      width = img.naturalWidth || img.width;
      height = img.naturalHeight || img.height;
      source = img;
    }

    if (!width || !height) {
      if (bitmap) bitmap.close();
      return file;
    }

    // Calculate new aspect-ratio-preserving dimensions
    let newWidth = width;
    let newHeight = height;

    if (width > maxWidth || height > maxHeight) {
      const widthRatio = maxWidth / width;
      const heightRatio = maxHeight / height;
      const ratio = Math.min(widthRatio, heightRatio);

      newWidth = Math.round(width * ratio);
      newHeight = Math.round(height * ratio);
    }

    // Draw to Canvas
    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      if (bitmap) bitmap.close();
      return file;
    }

    // High quality image scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(source, 0, 0, newWidth, newHeight);

    if (bitmap) {
      bitmap.close();
    }

    // Determine output MIME type (use image/jpeg for compression efficiency)
    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

    const compressedBlob = await new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        outputType,
        outputType === "image/jpeg" ? quality : undefined
      );
    });

    if (!compressedBlob) {
      return file;
    }

    // If compressed blob is actually larger than original, keep original
    if (compressedBlob.size >= file.size) {
      return file;
    }

    // Construct a new File object with original name
    const newFileName = file.name
      ? file.name.replace(/\.[^/.]+$/, "") + (outputType === "image/png" ? ".png" : ".jpg")
      : "image.jpg";

    const compressedFile = new File([compressedBlob], newFileName, {
      type: outputType,
      lastModified: Date.now(),
    });

    return compressedFile;
  } catch (error) {
    console.warn("Image compression failed, using original file:", error);
    return file;
  }
}
