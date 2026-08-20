import useStoreProfile from "../../hooks/useStoreProfile";
import useStartConversation from "../../hooks/useStartConversation";

import StoreHeader from "../../components/shared/store/StoreHeader";
import StoreProducts from "../../components/shared/store/StoreProducts";

import ReviewSection from "../../components/common/ReviewSection";

export default function StoreProfile() {
  const startConversation = useStartConversation();

  const {
    loading,
    farmer,
    products,
    averageRating,
    reviewCount,

    reviews,
  } = useStoreProfile();

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-8">Loading...</div>;
  }

  if (!farmer) {
    return <div className="mx-auto max-w-7xl px-4 py-8">Store not found.</div>;
  }

  return (
    <main className="mx-auto max-w-6xl overflow-hidden bg-white pb-16 shadow-sm md:pb-8">
      <StoreHeader
        farmer={farmer}
        averageRating={averageRating}
        reviewCount={reviewCount}
        onMessage={() => startConversation(farmer)}
      />

      <StoreProducts farmer={farmer} products={products} />

      <ReviewSection
        title="Farmer Reviews"
        reviews={reviews}
        type="farmer"
      />
    </main>
  );
}
