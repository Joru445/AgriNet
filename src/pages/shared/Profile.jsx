import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ProfileHeader from "../../components/shared/me/ProfileHeader";
import ProfileForm from "../../components/shared/me/ProfileForm";
import FarmerSection from "../../components/shared/me/FarmerSection";
import ProfileSkeleton from "../../components/shared/me/ProfileSkeleton";
import LogoutConfirmModal from "../../components/common/LogoutConfirmModal";
import PushNotificationManager from "../../components/common/PushNotificationManager";

import { useAuth } from "../../context/AuthContext";
import useProfile from "../../hooks/useProfile";

import { showToast } from "../../utils/toast";

export default function Profile() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const {
    loading,
    uploadingAvatar,

    editing,
    setEditing,

    form,
    stats,

    handleChange,
    handleSave,
    handleCancel,
    handleAvatar,
  } = useProfile(profile);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();

      showToast.success("Logged out.");
      setShowLogoutModal(false);
      navigate("/login");
    } catch (error) {
      console.error(error);

      showToast.error(error.message);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <main className="flex-1">
      {loading ? (
        <ProfileSkeleton />
      ) : (
        <div className="bg-white mx-auto max-w-6xl shadow-sm overflow-hidden pb-16 md:pb-8">
          <ProfileHeader
            profile={form}
            editing={editing}
            uploadingAvatar={uploadingAvatar}
            onEdit={() => setEditing(true)}
            onCancel={handleCancel}
            onSave={handleSave}
            onLogout={() => setShowLogoutModal(true)}
            onAvatarChange={handleAvatar}
          />

          <ProfileForm location={profile?.location} form={form} editing={editing} onChange={handleChange} />

          {form.role === "farmer" && (
            <FarmerSection
              form={form}
              stats={stats}
              editing={editing}
              onChange={handleChange}
            />
          )}

          {/* Push Notification Settings */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Notifications
            </h3>
            <PushNotificationManager />
          </div>
        </div>
      )}

      <LogoutConfirmModal
        open={showLogoutModal}
        loggingOut={loggingOut}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </main>
  );
}
