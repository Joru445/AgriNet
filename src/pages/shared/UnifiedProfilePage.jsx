import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import usePublicProfile from "../../hooks/usePublicProfile";
import useProfile from "../../hooks/useProfile";
import useStartConversation from "../../hooks/useStartConversation";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getUserApprovedGroups } from "../../services/group.service";
import { getPublicProfilePath, getSettingsPath } from "../../utils/routes";
import * as pageCache from "../../utils/pageCache";

import PublicProfileHeader from "../../components/profile/PublicProfileHeader";
import PublicProfileSkeleton from "../../components/profile/PublicProfileSkeleton";
import ProfileStats from "../../components/profile/ProfileStats";
import ConsumerProfileDetails from "../../components/profile/ConsumerProfileDetails";
import StoreProducts from "../../components/store/StoreProducts";
import ReviewSection from "../../components/reviews/ReviewSection";
import ProductGridSkeleton from "../../components/products/ProductGridSkeleton";
import GroupBadge from "../../components/groups/GroupBadge";
import GroupPreviewModal from "../../components/groups/GroupPreviewModal";
import ProfileForm from "../../components/me/ProfileForm";
import FarmerSection from "../../components/me/FarmerSection";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";

/** One public-safe layout for visitor and owner profile views. */
export default function UnifiedProfilePage() {
  const { uid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user: authUser, profile: privateProfile } = useAuth();
  const startConversation = useStartConversation();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const {
    loading, loadingProducts, loadingReviews, profile, role, products, reviews, stats, error,
  } = usePublicProfile();

  // UID equality is the ownership boundary. A matching username is not.
  const isOwner = Boolean(authUser?.uid && profile?.uid && authUser.uid === profile.uid);
  const editor = useProfile(isOwner ? privateProfile : null);

  useEffect(() => {
    if (uid && profile?.username) {
      navigate(`${getPublicProfilePath(profile)}${location.search}${location.hash}`, { replace: true });
    }
  }, [location.hash, location.search, navigate, profile, uid]);

  useEffect(() => {
    if (role !== "farmer" || !profile?.uid) {
      setGroups([]);
      return undefined;
    }
    let cancelled = false;
    getUserApprovedGroups(profile.uid)
      .then((approved) => { if (!cancelled) setGroups(approved); })
      .catch(() => { if (!cancelled) setGroups([]); });
    return () => { cancelled = true; };
  }, [profile?.uid, role]);

  async function saveProfile() {
    const updated = await editor.handleSave();
    if (!updated?.uid) return;
    pageCache.invalidatePrefix("publicProfile:");
    setEditOpen(false);
    if (updated.username) {
      navigate(`${getPublicProfilePath(updated)}${location.search}${location.hash}`, { replace: true });
    }
  }

  function closeEditor() {
    editor.handleCancel();
    setEditOpen(false);
  }

  if (loading) return <PublicProfileSkeleton />;

  if (!profile) {
    const isMissing = error?.kind === "not-found";
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState
          icon={isMissing ? "ri-user-unfollow-line" : "ri-wifi-off-line"}
          title={isMissing ? t("profile.profileNotFound") : t("profile.profileUnavailable")}
          description={isMissing
            ? t("profile.profileNotFoundDesc")
            : t("profile.profileUnavailableDesc")}
        />
      </main>
    );
  }

  const isFarmer = role === "farmer";
  return (
    <main className="mx-auto min-h-full w-full max-w-6xl bg-(--agri-surface) pb-12">
      <PublicProfileHeader
        profile={profile}
        role={role}
        groups={groups}
        isOwner={isOwner}
        onMessage={!isOwner ? () => startConversation(profile) : undefined}
        onEdit={() => setEditOpen(true)}
        onSettings={() => navigate(getSettingsPath())}
        onGroupClick={setSelectedGroup}
      />

      <ProfileStats stats={stats} role={role} className="mt-5" />

      <div className="space-y-7 px-4 py-6 sm:px-6">
        {isFarmer && groups.length > 0 && (
          <section className="border-b border-(--agri-border-subtle) pb-5">
            <h2 className="mb-3 text-sm font-bold text-(--agri-text)">{t("profile.organizations")}</h2>
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <GroupBadge key={group.groupId} {...group} size="md" showRole onClick={() => setSelectedGroup(group)} />
              ))}
            </div>
          </section>
        )}

        {isFarmer ? (
          <>
            {loadingProducts ? (
              <ProductGridSkeleton count={4} gridClassName="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4" />
            ) : (
              <StoreProducts farmer={profile} products={products} />
            )}
            <ReviewSection title={t("reviews.farmerTitle")} reviews={reviews} loading={loadingReviews} type="farmer" />
          </>
        ) : (
          <ConsumerProfileDetails profile={profile} />
        )}
      </div>

      {selectedGroup && (
        <GroupPreviewModal
          open
          onClose={() => setSelectedGroup(null)}
          groupId={selectedGroup.groupId}
          initialGroup={selectedGroup}
          farmerId={profile.uid}
        />
      )}

      <Modal
        open={editOpen}
        onClose={closeEditor}
        title={t("profile.editTitle")}
        description={t("profile.editDescription")}
        maxWidth="max-w-3xl"
        placement="center"
        bodyClassName="p-4 sm:p-6"
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="cancel" onClick={closeEditor} disabled={editor.saving}>{t("common.cancel")}</Button>
            <Button variant="save" onClick={saveProfile} disabled={editor.saving || editor.uploadingAvatar}>
              {editor.saving ? t("profile.saving") : t("profile.saveChanges")}
            </Button>
          </div>
        )}
      >
        {isOwner && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-(--agri-border-subtle) pb-4">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#2D6A4F] dark:text-(--agri-brand)">
                <i className={editor.uploadingAvatar ? "ri-loader-4-line animate-spin" : "ri-camera-line"} />
                {t("profile.changePic")}
                <input type="file" accept="image/*" className="sr-only" onChange={editor.handleAvatar} disabled={editor.uploadingAvatar} />
              </label>
            </div>
            <ProfileForm form={editor.form} editing onChange={editor.handleChange} onVisibilityChange={editor.handleVisibilityChange} />
            {role === "farmer" && (
              <FarmerSection
                form={editor.form}
                stats={editor.stats}
                editing
                onChange={editor.handleChange}
                onVisibilityChange={editor.handleVisibilityChange}
              />
            )}
          </div>
        )}
      </Modal>
    </main>
  );
}
