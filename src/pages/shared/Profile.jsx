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
import {
  ProfileContentSkeleton,
  ProfileHeaderSkeleton,
  ProfileStatsSkeleton,
} from "../../components/profile/PublicProfileSkeleton";
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

  // If public profile request fails (e.g. mobile connectivity, backend cold start),
  // fall back to authenticated profile for the owner so their profile is never unavailable to themselves.
  const isOwner = Boolean(
    (authUser?.uid && profile?.uid && authUser.uid === profile.uid) ||
    (authUser?.uid && privateProfile?.username && username && privateProfile.username.toLowerCase() === username.toLowerCase()) ||
    (authUser?.uid && (!username || username === "profile" || username === "me") && privateProfile?.uid)
  );

  const activeProfile = profile || (isOwner ? privateProfile : null);
  const activeRole = activeProfile?.role ?? role ?? privateProfile?.role ?? null;

  useEffect(() => {
    const canonicalPath = getProfilePath(activeProfile?.username);
    const needsCanonicalRedirect = Boolean(
      canonicalPath && username && username !== username.toLowerCase(),
    );
    if (needsCanonicalRedirect) {
      navigate(`${canonicalPath}${location.search}${location.hash}`, {
        replace: true,
      });
    }
  }, [location.hash, location.search, navigate, activeProfile?.username, username]);

  useEffect(() => {
    if (activeRole !== "farmer" || !activeProfile?.uid) {
      setGroups([]);
      return undefined;
    }
    let cancelled = false;
    getUserApprovedGroups(activeProfile.uid)
      .then((approved) => {
        if (!cancelled) setGroups(approved);
      })
      .catch(() => {
        if (!cancelled) setGroups([]);
      });
    return () => {
      cancelled = true;
    };
  }, [activeProfile?.uid, activeRole]);

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

  if (!activeProfile && !loading) {
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
          action={t("common.retry")}
          onAction={reload}
        />
      </main>
    );
  }

  const isFarmer = activeRole === "farmer";
  return (
    <main className="mx-auto min-h-full w-full max-w-6xl bg-(--agri-surface) pb-12">
      {activeProfile ? (
        <PublicProfileHeader
          profile={activeProfile}
          role={activeRole}
          groups={groups}
          isOwner={isOwner}
          onMessage={!isOwner ? () => startConversation(activeProfile) : undefined}
          onEdit={() => setEditOpen(true)}
          onSettings={() => navigate(getSettingsPath())}
          onGroupClick={setSelectedGroup}
        />
      ) : <ProfileHeaderSkeleton />}

      <div className="space-y-7 px-4 py-6 sm:px-6">
        {activeProfile && isOwner && <ProfileTransactions />}

        {activeProfile && isFarmer && groups.length > 0 && (
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
      {activeProfile ? <ProfileStats stats={stats} role={activeRole} /> : <ProfileStatsSkeleton />}

      {activeProfile && isFarmer ? (
        <>
          {loadingProducts ? (
            <ProductGridSkeleton
              count={4}
              gridClassName="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4"
            />
          ) : (
            <StoreProducts farmer={activeProfile} products={products} />
          )}
          <ReviewSection
            title={t("reviews.farmerTitle")}
            reviews={reviews}
            loading={loadingReviews}
            type="farmer"
          />
        </>
      ) : activeProfile ? (
        <ConsumerProfileDetails profile={activeProfile} />
      ) : <ProfileContentSkeleton />}

      {activeProfile && selectedGroup && (
        <GroupPreviewModal
          open
          onClose={() => setSelectedGroup(null)}
          groupId={selectedGroup.groupId}
          initialGroup={selectedGroup}
          farmerId={activeProfile.uid}
        />
      )}

      {activeProfile && editOpen && isOwner && (
        <ProfileEditor
          open
          profile={privateProfile || { uid: authUser.uid, role: activeRole }}
          role={activeRole}
          onClose={() => setEditOpen(false)}
          onSaved={saveProfile}
        />
      )}
    </main>
  );
}
