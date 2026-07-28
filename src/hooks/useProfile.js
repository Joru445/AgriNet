import { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    phone: "",
    bio: "",

    role: "",

    location: {
      address: "",
      lat: null,
      lng: null,
    },

    farmName: "",
    description: "",
    rating: 0,
    verified: false,
    profilePicture: "",
    profilePictureId: "",
  });

  const [stats, setStats] = useState({
    products: 0,
    reviews: 0,
    inquiries: 0,
    completed: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("location.")) {
      const key = name.split(".")[1];

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
      [name]: value,
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
      await loadProfile();

      showToast.success("Profile updated!");

      setEditing(false);
    } catch (error) {
      showToast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    await loadProfile();
    setEditing(false);
  }

  async function loadProfile() {
    try {
      setLoading(true);

      const user = await getUserProfile(profile.uid);

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
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadStats(uid) {
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
    }
  }

  async function handleAvatar(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const image = await uploadProfilePicture(file);

      setForm((prev) => ({
        ...prev,
        profilePicture: image.url,
        profilePictureId: image.publicId,
      }));

      showToast.success("Profile picture uploaded.");
    } catch (error) {
      showToast.error(error.message);
    }
  }

  useEffect(() => {
    if (!profile?.uid) return;

    const initialize = async () => {
      await loadProfile();
    };

    initialize();
  }, [profile?.uid]);

  return {
    loading,
    saving,

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
