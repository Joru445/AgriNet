import useStoreProfile from "../../hooks/useStoreProfile";
import useStartConversation from "../../hooks/useStartConversation";

import StoreHeader from "../../components/shared/store/StoreHeader";
import StoreProducts from "../../components/shared/store/StoreProducts";
import ReviewSection from "../../components/common/ReviewSection";
import { ProductGridSkeleton } from "../../components/consumer/home/MarketplaceSkeleton";

export default function StoreProfile() {
  const startConversation = useStartConversation();

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
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <i className="ri-store-2-line text-5xl text-gray-300 mb-3" />
          <h2 className="text-lg font-bold text-gray-800">Store Not Found</h2>
          <p className="text-sm text-gray-500 mt-1">
            The requested farmer or store profile does not exist.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl overflow-hidden bg-white pb-16 shadow-sm md:pb-8">
      {/* Header skeleton or actual header */}
      {loading ? (
        <div className="animate-pulse">
          <div className="h-56 sm:h-72 md:h-80 lg:h-[380px] bg-gray-200 sm:rounded-b-2xl" />
          <div className="px-4 sm:px-6 pb-6 pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gray-200 shadow-md shrink-0" />
                <div className="space-y-2 pb-2">
                  <div className="h-6 w-48 bg-gray-200 rounded" />
                  <div className="h-4 w-32 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-10 w-32 bg-gray-200 rounded-xl shrink-0" />
            </div>
            <div className="mt-6 space-y-2 max-w-xl">
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
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
        <section className="px-4 sm:px-6 py-6 border-t border-gray-100">
          <div className="h-6 w-32 bg-gray-200 rounded mb-5 animate-pulse" />
          <ProductGridSkeleton count={4} />
        </section>
      ) : (
        <StoreProducts farmer={farmer} products={products} />
      )}

      {/* Reviews section */}
      <div className="px-4 sm:px-6 py-6 border-t border-gray-100">
        <ReviewSection
          title="Farmer Reviews"
          reviews={reviews}
          loading={loadingReviews}
          type="farmer"
        />
      </div>
    </main>
  );
}
