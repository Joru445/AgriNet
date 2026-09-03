import usePublicProfile from "../../hooks/usePublicProfile";
import useStartConversation from "../../hooks/useStartConversation";
import { useLanguage } from "../../context/LanguageContext";

import PublicProfileHeader from "../../components/shared/profile/PublicProfileHeader";
import PublicProfileSkeleton from "../../components/shared/profile/PublicProfileSkeleton";
import ConsumerProfileDetails from "../../components/shared/profile/ConsumerProfileDetails";
import StoreProducts from "../../components/shared/store/StoreProducts";
import ReviewSection from "../../components/common/ReviewSection";
import ProductGridSkeleton from "../../components/shared/product/ProductGridSkeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function PublicProfile() {
  const startConversation = useStartConversation();
  const { t } = useLanguage();

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
    <main className="mx-auto max-w-6xl overflow-hidden bg-[var(--agri-page)] pb-16 shadow-sm md:pb-8">
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

      {/* Farmer: products */}
      {isFarmer &&
        (loadingProducts ? (
          <section className="px-4 sm:px-6 py-6 border-t border-[var(--agri-border-subtle)]">
            <div className="h-6 w-32 bg-[var(--agri-hover)] rounded mb-5 animate-pulse" />
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
        <div className="px-4 sm:px-6 py-6 border-t border-[var(--agri-border-subtle)]">
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