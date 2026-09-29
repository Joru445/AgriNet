import { useEffect, useState } from "react";
import usePublicProfile from "../../hooks/usePublicProfile";
import useStartConversation from "../../hooks/useStartConversation";
import { useLanguage } from "../../context/LanguageContext";
import { getUserApprovedGroups } from "../../services/group.service";

import PublicProfileHeader from "../../components/profile/PublicProfileHeader";
import PublicProfileSkeleton from "../../components/profile/PublicProfileSkeleton";
import ConsumerProfileDetails from "../../components/profile/ConsumerProfileDetails";
import StoreProducts from "../../components/store/StoreProducts";
import ReviewSection from "../../components/reviews/ReviewSection";
import ProductGridSkeleton from "../../components/products/ProductGridSkeleton";
import EmptyState from "../../components/ui/EmptyState";
import GroupBadge from "../../components/groups/GroupBadge";
import GroupPreviewModal from "../../components/groups/GroupPreviewModal";

export default function PublicProfile() {
  const startConversation = useStartConversation();
  const { t } = useLanguage();

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const {
    loading,
    loadingProducts,
    loadingReviews,

    profile,
    role,

    products,
    averageRating,
    reviewCount,
    reviews,

    stats,
  } = usePublicProfile();

  useEffect(() => {
    if (role !== "farmer" || !profile?.uid) {
      setGroups([]);
      return;
    }

    let cancelled = false;
    getUserApprovedGroups(profile.uid)
      .then((approvedGroups) => {
        if (!cancelled) setGroups(approvedGroups);
      })
      .catch(() => {
        if (!cancelled) setGroups([]);
      });

    return () => {
      cancelled = true;
    };
  }, [profile?.uid, role]);

  if (!loading && !profile) {
    return (
      <main className="mx-auto max-w-6xl p-6 md:p-8">
        <EmptyState
          icon="ri-user-3-line"
          title={t("storeProfile.notFound")}
          description={t("storeProfile.notFoundDesc")}
        />
      </main>
    );
  }

  const isFarmer = role === "farmer";

  return (
    <main className="mx-auto w-full min-w-0 max-w-6xl min-h-full flex flex-col bg-(--agri-surface) pb-16 md:pb-8 shadow-sm">
      {loading ? (
        <PublicProfileSkeleton />
      ) : (
        <PublicProfileHeader
          profile={profile}
          role={role}
          averageRating={averageRating}
          reviewCount={reviewCount}
          stats={stats}
          groups={groups}
          onMessage={() => startConversation(profile)}
          onGroupClick={(g) => setSelectedGroup(g)}
        />
      )}

      {/* Farmer: Group / Organization Affiliations */}
      {isFarmer && groups.length > 0 && (
        <section className="px-4 sm:px-6 py-4 border-t border-(--agri-border-subtle) bg-(--agri-card)">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-(--agri-text)">
              <i className="ri-community-line text-base text-[#2D6A4F] dark:text-(--agri-brand)" />
              {t("profile.organizations")}
            </h2>
            <span className="text-xs font-semibold text-(--agri-text-muted)">
              {groups.length} {t("profile.member")}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <GroupBadge
                key={g.groupId}
                groupId={g.groupId}
                groupName={g.groupName}
                groupImageUrl={g.groupImageUrl}
                size="md"
                showRole
                onClick={() => setSelectedGroup(g)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Farmer: products */}
      {isFarmer &&
        (loadingProducts ? (
          <section className="px-4 sm:px-6 py-6 border-t border-(--agri-border-subtle)">
            <div className="h-6 w-32 bg-(--agri-hover) rounded mb-5 animate-pulse" />
            <ProductGridSkeleton
              count={4}
              gridClassName="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6"
            />
          </section>
        ) : (
          <StoreProducts farmer={profile} products={products} />
        ))}

      {/* Farmer: reviews */}
      {isFarmer && (
        <div className="px-4 sm:px-6 py-6 border-t border-(--agri-border-subtle)">
          <ReviewSection
            title={t("reviews.farmerTitle")}
            reviews={reviews}
            loading={loadingReviews}
            type="farmer"
          />
        </div>
      )}

      {/* Consumer: about / details */}
      {!isFarmer && (
        <ConsumerProfileDetails
          profile={profile}
          stats={stats}
        />
      )}

      {selectedGroup && (
        <GroupPreviewModal
          open={Boolean(selectedGroup)}
          onClose={() => setSelectedGroup(null)}
          groupId={selectedGroup.groupId}
          initialGroup={selectedGroup}
          farmerId={profile?.uid}
        />
      )}
    </main>
  );
}
