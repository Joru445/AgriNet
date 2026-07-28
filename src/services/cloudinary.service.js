const CLOUD_NAME = "uytz6pnb";

const PROFILE_PRESET = "agrinet_profile";
const PRODUCT_PRESET = "agrinet_products";

async function uploadImage(file, uploadPreset) {
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
