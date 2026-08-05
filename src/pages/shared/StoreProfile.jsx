import useStoreProfile from "../../hooks/useStoreProfile";
import useStartConversation from "../../hooks/useStartConversation";

import StoreHeader from "../../components/store/StoreHeader";
import StoreAbout from "../../components/store/StoreAbout";
import StoreProducts from "../../components/store/StoreProducts";

export default function StoreProfile() {
  const startConversation = useStartConversation();

  const {
    loading,
    farmer,
    products,
    averageRating,
    reviewCount,
  } = useStoreProfile();

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20 space-y-8">
      <StoreHeader
        farmer={farmer}
        averageRating={averageRating}
        reviewCount={reviewCount}
        onMessage={() => startConversation(farmer)}
      />

      <StoreAbout farmer={farmer} />

      <StoreProducts farmer={farmer} products={products} />
    </div>
  );
}
