import { useCallback, useEffect, useRef, useState } from "react";

import { uploadProfilePicture } from "../services/cloudinary.service";
import { updateUser, getUserProfile } from "../services/user.service";
import { updateFarmer, getFarmerById } from "../services/farmer.service";
import { getFarmerProducts } from "../services/product.service";
import {
  getFarmerReviewCount,
  getAverageFarmerRating,
} from "../services/farmer-review.service";

import { showToast } from "../utils/toast";

export default function useProfile(profile) {
  const [loading, setLoading] = useState(!profile?.uid);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const hasLoadedRef = useRef(false);

  // Track the original profile picture so cancel can revert
  const originalPictureRef = useRef(profile?.profilePicture || "");
  const originalPictureIdRef = useRef(profile?.profilePictureId || "");

  // Track blob URLs for cleanup
  const blobUrlRef = useRef(null);

  const [form, setForm] = useState(() => ({
    fullname: profile?.fullname || "",
    username: profile?.username || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "",

    role: profile?.role || "",

    location: profile?.location || {
      address: "",
      lat: null,
      lng: null,
    },

    storeName: profile?.storeName || "",
    description: profile?.description || "",
    rating: profile?.rating || 0,
    verified: profile?.verified === true,
    profilePicture: profile?.profilePicture || "",
    profilePictureId: profile?.profilePictureId || "",
  }));

  const [stats, setStats] = useState({
    products: 0,
    reviews: 0,
    inquiries: 0,
    completed: 0,
  });

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name === "contactNumber" ? "phone" : name;

    if (fieldName.startsWith("location.")) {
      const key = fieldName.split(".")[1];

      setForm((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [key]: value,
        },
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  async function handleSave() {
    // Guard: don't save if avatar upload is still in progress
    if (uploadingAvatar) {
      showToast.error("Please wait for the profile picture to finish uploading.");
      return;
    }

    // Basic validation
    const trimmedFullname = form.fullname?.trim();
    const trimmedUsername = form.username?.trim();

    if (!trimmedFullname) {
      showToast.error("Full name is required.");
      return;
    }

    if (!trimmedUsername) {
      showToast.error("Username is required.");
      return;
    }

    if (trimmedUsername.length < 3) {
      showToast.error("Username must be at least 3 characters.");
      return;
    }

    if (!/^[a-z0-9._]+$/.test(trimmedUsername)) {
      showToast.error("Username can only contain lowercase letters, numbers, dots, and underscores.");
      return;
    }

    setSaving(true);

    try {
      await updateUser(profile.uid, {
        username: trimmedUsername.toLowerCase(),
        fullname: trimmedFullname,
        fullnameLower: trimmedFullname.toLowerCase(),
        phone: form.phone,
        bio: form.bio,
        location: form.location,
        profilePicture: form.profilePicture,
        profilePictureId: form.profilePictureId,
      });

      if (profile.role === "farmer") {
        await updateFarmer(profile.uid, {
          username: trimmedUsername.toLowerCase(),
          fullname: trimmedFullname,
          fullnameLower: trimmedFullname.toLowerCase(),
          phone: form.phone,
          location: form.location,
          profilePicture: form.profilePicture,
          profilePictureId: form.profilePictureId,
          storeName: form.storeName,
          description: form.description,
        });
      }

      // Update tracked originals after successful save
      originalPictureRef.current = form.profilePicture;
      originalPictureIdRef.current = form.profilePictureId;

      showToast.success("Profile updated!");
      setEditing(false);
    } catch (error) {
      showToast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    // Revoke any blob URL from avatar preview
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    // Revert to the last-saved avatar (or original)
    setForm((prev) => ({
      ...prev,
      profilePicture: originalPictureRef.current,
      profilePictureId: originalPictureIdRef.current,
    }));

    await loadProfile(false);
    setEditing(false);
  }

  const loadStats = useCallback(async (uid) => {
    try {
      const [products, reviews, rating] = await Promise.all([
        getFarmerProducts(uid),
        getFarmerReviewCount(uid),
        getAverageFarmerRating(uid),
      ]);

      setStats({
        products: products.length,
        reviews,
        inquiries: 0,
        completed: 0,
      });

      return rating;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }, []);

  const loadProfile = useCallback(
    async (isInitial = false) => {
      if (!profile?.uid) return;

      try {
        if (isInitial && !hasLoadedRef.current) {
          setLoading(true);
        }

        const user = await getUserProfile(profile.uid);

        if (!user) return;

        let rating = 0;
        let farmer = null;

        if (user.role === "farmer") {
          farmer = await getFarmerById(profile.uid);

          rating = await loadStats(profile.uid);
        }

        setForm({
          ...user,
          ...farmer,
          rating,
          profilePicture: user.profilePicture || "",
          profilePictureId: user.profilePictureId || "",
        });

        // Sync originals
        originalPictureRef.current = user.profilePicture || "";
        originalPictureIdRef.current = user.profilePictureId || "";

        hasLoadedRef.current = true;
      } finally {
        setLoading(false);
      }
    },
    [loadStats, profile?.uid],
  );

  async function handleAvatar(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    // Reset value so picking the same file works
    e.target.value = "";

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast.error("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast.error("Image must be less than 10 MB.");
      return;
    }

    // Immediately switch to editing mode so "Save Changes" is visible
    setEditing(true);

    // Revoke previous blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    try {
      setUploadingAvatar(true);

      // Instant local preview
      const localPreview = URL.createObjectURL(file);
      blobUrlRef.current = localPreview;

      setForm((prev) => ({
        ...prev,
        profilePicture: localPreview,
      }));

      const image = await uploadProfilePicture(file);

      // Clear blob URL ref since upload succeeded (Cloudinary URL now)
      blobUrlRef.current = null;

      setForm((prev) => ({
        ...prev,
        profilePicture: image.url,
        profilePictureId: image.publicId,
      }));

      showToast.success("Photo uploaded. Click Save Changes to save.");
    } catch (error) {
      // Revert to previous avatar on failure
      setForm((prev) => ({
        ...prev,
        profilePicture: originalPictureRef.current,
        profilePictureId: originalPictureIdRef.current,
      }));

      showToast.error(error.message || "Failed to upload profile picture.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  useEffect(() => {
    if (!hasLoadedRef.current && profile?.uid) {
      loadProfile(true);
    }
  }, [loadProfile, profile?.uid]);

  return {
    loading,
    saving,
    uploadingAvatar,

    editing,
    setEditing,

    form,
    stats,

    handleChange,
    handleSave,
    handleCancel,
    handleAvatar,
  };
}
