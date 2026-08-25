import { compressImage } from "../utils/imageCompression";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const DEFAULT_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const PROFILE_PRESET =
  import.meta.env.VITE_CLOUDINARY_PROFILE_PRESET ?? DEFAULT_PRESET;

const PRODUCT_PRESET =
  import.meta.env.VITE_CLOUDINARY_PRODUCT_PRESET ?? DEFAULT_PRESET;

const TRANSACTION_PRESET =
  import.meta.env.VITE_CLOUDINARY_TRANSACTION_PRESET ?? DEFAULT_PRESET;

const MESSAGE_PRESET =
  import.meta.env.VITE_CLOUDINARY_MESSAGE_PRESET ?? DEFAULT_PRESET;

async function uploadImage(file, uploadPreset) {
  if (!CLOUD_NAME || !uploadPreset) {
    throw new Error("Cloudinary upload configuration is missing.");
  }

  if (!file) {
    throw new Error("An image file is required.");
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to upload image.");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}

export function uploadProfilePicture(file) {
  return uploadImage(file, PROFILE_PRESET);
}

export function uploadProductImage(file) {
  return uploadImage(file, PRODUCT_PRESET);
}

export function uploadTransactionProof(file) {
  return uploadImage(file, TRANSACTION_PRESET);
}

export async function uploadMessageImage(file) {
  const compressed = await compressImage(file);
  return uploadImage(compressed, MESSAGE_PRESET);
}
