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

export default function PublicProfile() {
  const startConversation = useStartConversation();
  const { t } = useLanguage();

  const [groups, setGroups] = useState([]);

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
    if (!profile?.uid) return;
    getUserApprovedGroups(profile.uid)
      .then(setGroups)
      .catch(() => setGroups([]));
  }, [profile?.uid]);

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
    <main className="mx-auto max-w-6xl min-h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-(--agri-surface) pb-16 shadow-sm md:pb-8">
      {loading ? (
        <PublicProfileSkeleton />
      ) : (
        <PublicProfileHeader
          profile={profile}
          role={role}
          averageRating={averageRating}
          reviewCount={reviewCount}
          stats={stats}
          onMessage={() => startConversation(profile)}
        />
      )}

      {/* Group memberships */}
      {groups.length > 0 && (
        <section className="px-4 sm:px-6 py-4 border-t border-(--agri-border-subtle)">
          <h3 className="flex items-center gap-2 text-sm font-bold text-(--agri-text) mb-3">
            <i className="ri-team-line text-[#2D6A4F] dark:text-(--agri-brand)" />
            {t("profile.groups")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <GroupBadge
                key={g.groupId}
                groupId={g.groupId}
                groupName={g.groupName}
                groupImageUrl={g.groupImageUrl}
                size="md"
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
    </main>
  );
}