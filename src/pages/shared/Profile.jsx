import { useNavigate } from "react-router-dom";

import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileForm from "../../components/profile/ProfileForm";
import FarmerSection from "../../components/profile/FarmerSection";
import ProfileSkeleton from "../../components/profile/ProfileSkeleton";

import { useAuth } from "../../context/AuthContext";
import useProfile from "../../hooks/useProfile";

import { showToast } from "../../utils/toast";

export default function Profile() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const {
    loading,

    editing,
    setEditing,

    form,
    stats,

    handleChange,
    handleSave,
    handleCancel,
    handleAvatar,
  } = useProfile(profile);

  if (loading) {
    return <ProfileSkeleton />;
  }

  async function handleLogout() {
    try {
      await logout();

      showToast.success("Logged out.");

      navigate("/login");
    } catch (error) {
      console.error(error);

      showToast.error(error.message);
    }
  }

  return (
    <main className="flex-1">
      <div className="bg-white mx-auto max-w-6xl shadow-sm overflow-hidden pb-16 md:pb-8">
        <ProfileHeader
          profile={form}
          editing={editing}
          onEdit={() => setEditing(true)}
          onCancel={handleCancel}
          onSave={handleSave}
          onLogout={handleLogout}
          onAvatarChange={handleAvatar}
        />

        <ProfileForm location={profile.location} form={form} editing={editing} onChange={handleChange} />

        {form.role === "farmer" && (
          <FarmerSection
            form={form}
            stats={stats}
            editing={editing}
            onChange={handleChange}
          />
        )}
      </div>
    </main>
  );
}
