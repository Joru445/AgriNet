import useStoreProfile from "../../hooks/useStoreProfile";
import useStartConversation from "../../hooks/useStartConversation";
import { useLanguage } from "../../context/LanguageContext";

import StoreHeader from "../../components/shared/store/StoreHeader";
import StoreHeaderSkeleton from "../../components/shared/store/StoreHeaderSkeleton";
import StoreProducts from "../../components/shared/store/StoreProducts";
import ReviewSection from "../../components/common/ReviewSection";
import { ProductGridSkeleton } from "../../components/consumer/home/MarketplaceSkeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function StoreProfile() {
  const startConversation = useStartConversation();
  const { t } = useLanguage();

  const {
    loading,
    loadingProducts,
    loadingReviews,

    farmer,
    products,
    averageRating,
    reviewCount,

    reviews,
  } = useStoreProfile();

  if (!loading && !farmer) {
    return (
      <main className="mx-auto max-w-6xl p-6 md:p-8">
        <EmptyState
          icon="ri-store-2-line"
          title={t("storeProfile.notFound")}
          description={t("storeProfile.notFoundDesc")}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl overflow-hidden bg-[var(--agri-page)] pb-16 shadow-sm md:pb-8">
      {/* Header skeleton or actual header */}
      {loading ? (
        <StoreHeaderSkeleton />
      ) : (
        <StoreHeader
          farmer={farmer}
          averageRating={averageRating}
          reviewCount={reviewCount}
          onMessage={() => startConversation(farmer)}
        />
      )}

      {/* Products section */}
      {loadingProducts ? (
        <section className="px-4 sm:px-6 py-6 border-t border-[var(--agri-border-subtle)]">
          <div className="h-6 w-32 bg-[var(--agri-hover)] rounded mb-5 animate-pulse" />
          <ProductGridSkeleton count={4} />
        </section>
      ) : (
        <StoreProducts farmer={farmer} products={products} />
      )}

      {/* Reviews section */}
      <div className="px-4 sm:px-6 py-6 border-t border-[var(--agri-border-subtle)]">
        <ReviewSection
          title={t("reviews.farmerTitle")}
          reviews={reviews}
          loading={loadingReviews}
          type="farmer"
        />
      </div>
    </main>
  );
}
