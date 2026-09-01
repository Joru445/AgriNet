const UPLOAD_MARKER = "/upload/";

/**
 * Apply Cloudinary URL transformations to an existing image URL.
 * Inserts transformation parameters after /upload/ in the URL.
 *
 * @param {string} url - The original Cloudinary URL
 * @param {string} transforms - Cloudinary transformation string (e.g. "w_300,h_300,c_fill,q_auto,f_auto")
 * @returns {string} The transformed URL, or original URL if not a Cloudinary URL
 */
export function applyTransform(url, transforms) {
  if (!url || !transforms) return url;

  const uploadIdx = url.indexOf(UPLOAD_MARKER);
  if (uploadIdx === -1) return url;

  const insertAt = uploadIdx + UPLOAD_MARKER.length;

  // Avoid double-appending if transforms already present
  const afterUpload = url.slice(insertAt);
  if (afterUpload.startsWith(transforms) || afterUpload.includes(`/${transforms}/`)) {
    return url;
  }

  return `${url.slice(0, insertAt)}${transforms}/${url.slice(insertAt)}`;
}

/**
 * Check if a URL is a Cloudinary URL.
 */
export function isCloudinaryUrl(url) {
  return Boolean(url) && url.includes("res.cloudinary.com");
}

// ── Preset transform combinations ──────────────────────────────────

/**
 * Profile picture: 256×256 crop, auto format+quality.
 * Suitable for avatars, sidebar pics, conversation thumbnails.
 */
export const PROFILE_TF = "w_256,h_256,c_fill,f_auto,q_auto";

/**
 * Small avatar: 64×64 crop (conversation list, message bubbles).
 */
export const AVATAR_SM_TF = "w_64,h_64,c_fill,f_auto,q_auto";

/**
 * Medium avatar: 128×128 crop (headers, cards).
 */
export const AVATAR_MD_TF = "w_128,h_128,c_fill,f_auto,q_auto";

/**
 * Large avatar: 320×320 crop (profile pages).
 */
export const AVATAR_LG_TF = "w_320,h_320,c_fill,f_auto,q_auto";

/**
 * Product card thumbnail: 400×400, auto format+quality.
 */
export const PRODUCT_THUMB_TF = "w_400,h_400,c_fill,f_auto,q_auto";

/**
 * Product detail image: 800×800, auto format+quality.
 */
export const PRODUCT_DETAIL_TF = "w_800,h_800,c_fill,f_auto,q_auto";

/**
 * Product gallery full: 1200×1200, auto format+quality.
 */
export const PRODUCT_GALLERY_TF = "w_1200,h_1200,c_fill,f_auto,q_auto";

/**
 * Cover photo: 1600×auto, fill width, auto format+quality.
 */
export const COVER_TF = "w_1600,c_fill,f_auto,q_auto";

/**
 * Message image: 800 wide, auto height, auto format+quality.
 */
export const MESSAGE_IMG_TF = "w_800,f_auto,q_auto";

/**
 * Thumbnail for image list items: 160×160 crop.
 */
export const THUMB_SM_TF = "w_160,h_160,c_fill,f_auto,q_auto";

// ── Convenience helpers ────────────────────────────────────────────

export function profilePic(url) {
  return applyTransform(url, PROFILE_TF);
}

export function avatarSm(url) {
  return applyTransform(url, AVATAR_SM_TF);
}

export function avatarMd(url) {
  return applyTransform(url, AVATAR_MD_TF);
}

export function avatarLg(url) {
  return applyTransform(url, AVATAR_LG_TF);
}

export function productThumb(url) {
  return applyTransform(url, PRODUCT_THUMB_TF);
}

export function productDetail(url) {
  return applyTransform(url, PRODUCT_DETAIL_TF);
}

export function productGallery(url) {
  return applyTransform(url, PRODUCT_GALLERY_TF);
}

export function coverPhoto(url) {
  return applyTransform(url, COVER_TF);
}

export function messageImage(url) {
  return applyTransform(url, MESSAGE_IMG_TF);
}

export function thumbSm(url) {
  return applyTransform(url, THUMB_SM_TF);
}
