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

    farmName: profile?.farmName || "",
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
    setSaving(true);

    try {
      await updateUser(profile.uid, {
        username: form.username.toLowerCase(),
        fullname: form.fullname,
        fullnameLower: form.fullname.toLowerCase(),
        phone: form.phone,
        bio: form.bio,
        location: form.location,
        profilePicture: form.profilePicture,
        profilePictureId: form.profilePictureId,
      });

      if (profile.role === "farmer") {
        await updateFarmer(profile.uid, {
          username: form.username.toLowerCase(),
          fullname: form.fullname,
          fullnameLower: form.fullname.toLowerCase(),
          phone: form.phone,
          location: form.location,
          profilePicture: form.profilePicture,
          profilePictureId: form.profilePictureId,
          farmName: form.farmName,
          description: form.description,
        });
      }
      await loadProfile(false);

      showToast.success("Profile updated!");

      setEditing(false);
    } catch (error) {
      showToast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
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

        setForm((prev) => ({
          ...user,
          ...farmer,
          rating,
          profilePicture: prev.profilePicture || user.profilePicture || "",
          profilePictureId: prev.profilePictureId || user.profilePictureId || "",
        }));

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

    // IMMEDIATELY switch to editing mode so "Save Changes" is visible!
    setEditing(true);

    try {
      setUploadingAvatar(true);

      // Instant local preview for immediate visual feedback without waiting
      const localPreview = URL.createObjectURL(file);
      setForm((prev) => ({
        ...prev,
        profilePicture: localPreview,
      }));

      const image = await uploadProfilePicture(file);

      setForm((prev) => ({
        ...prev,
        profilePicture: image.url,
        profilePictureId: image.publicId,
      }));

      setEditing(true);

      showToast.success("Photo selected. Click Save Changes to save.");
    } catch (error) {
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
