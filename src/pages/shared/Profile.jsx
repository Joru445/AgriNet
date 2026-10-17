import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import usePublicProfile from "../../hooks/usePublicProfile";
import useStartConversation from "../../hooks/useStartConversation";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getUserApprovedGroups } from "../../services/group.service";
import { getProfilePath, getSettingsPath } from "../../utils/routes";
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
import EmptyState from "../../components/ui/EmptyState";
import ProfileTransactions from "../../components/profile/ProfileTransactions";
import ProfileEditor from "../../components/profile/ProfileEditor";

/** One public-safe layout for visitor and owner profile views. */
export default function Profile() {
  const { username } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user: authUser, profile: privateProfile } = useAuth();
  const startConversation = useStartConversation();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const {
    loading,
    loadingProducts,
    loadingReviews,
    profile,
    role,
    products,
    reviews,
    stats,
    error,
    reload,
  } = usePublicProfile();

  // UID equality is the ownership boundary. A matching username is not.
  const isOwner = Boolean(
    authUser?.uid && profile?.uid && authUser.uid === profile.uid,
  );

  useEffect(() => {
    const canonicalPath = getProfilePath(profile?.username);
    const needsCanonicalRedirect = Boolean(
      canonicalPath && username && username !== username.toLowerCase(),
    );
    if (needsCanonicalRedirect) {
      navigate(`${canonicalPath}${location.search}${location.hash}`, {
        replace: true,
      });
    }
  }, [location.hash, location.search, navigate, profile?.username, username]);

  useEffect(() => {
    if (role !== "farmer" || !profile?.uid) {
      setGroups([]);
      return undefined;
    }
    let cancelled = false;
    getUserApprovedGroups(profile.uid)
      .then((approved) => {
        if (!cancelled) setGroups(approved);
      })
      .catch(() => {
        if (!cancelled) setGroups([]);
      });
    return () => {
      cancelled = true;
    };
  }, [profile?.uid, role]);

  function saveProfile(updated) {
    if (!updated?.uid) return;
    pageCache.invalidatePrefix("publicProfile:");
    setEditOpen(false);
    if (updated.username) {
      const nextPath = getProfilePath(updated.username);
      if (nextPath && nextPath !== location.pathname) {
        navigate(`${nextPath}${location.search}${location.hash}`, {
          replace: true,
        });
        return;
      }
    }
    reload();
  }

  if (loading) return <PublicProfileSkeleton />;

  if (!profile) {
    const isMissing = error?.kind === "not-found";
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState
          icon={isMissing ? "ri-user-unfollow-line" : "ri-wifi-off-line"}
          title={
            isMissing
              ? t("profile.profileNotFound")
              : t("profile.profileUnavailable")
          }
          description={
            isMissing
              ? t("profile.profileNotFoundDesc")
              : t("profile.profileUnavailableDesc")
          }
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

      <div className="space-y-7 px-4 py-6 sm:px-6">
        {isOwner && <ProfileTransactions />}

        {isFarmer && groups.length > 0 && (
          <section className="border-b border-(--agri-border-subtle) pb-5">
            <h2 className="mb-3 text-sm font-bold text-(--agri-text)">
              {t("profile.organizations")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <GroupBadge
                  key={group.groupId}
                  {...group}
                  size="md"
                  showRole
                  onClick={() => setSelectedGroup(group)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
      <ProfileStats stats={stats} role={role} />

      {isFarmer ? (
        <>
          {loadingProducts ? (
            <ProductGridSkeleton
              count={4}
              gridClassName="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4"
            />
          ) : (
            <StoreProducts farmer={profile} products={products} />
          )}
          <ReviewSection
            title={t("reviews.farmerTitle")}
            reviews={reviews}
            loading={loadingReviews}
            type="farmer"
          />
        </>
      ) : (
        <ConsumerProfileDetails profile={profile} />
      )}

      {selectedGroup && (
        <GroupPreviewModal
          open
          onClose={() => setSelectedGroup(null)}
          groupId={selectedGroup.groupId}
          initialGroup={selectedGroup}
          farmerId={profile.uid}
        />
      )}

      {editOpen && isOwner && (
        <ProfileEditor
          open
          profile={privateProfile || { uid: authUser.uid, role }}
          role={role}
          onClose={() => setEditOpen(false)}
          onSaved={saveProfile}
        />
      )}
    </main>
  );
}
