import useStoreProfile from "../../hooks/useStoreProfile";
import useStartConversation from "../../hooks/useStartConversation";

import StoreHeader from "../../components/store/StoreHeader";
import StoreProducts from "../../components/store/StoreProducts";

export default function StoreProfile() {
  const startConversation = useStartConversation();

  const { loading, farmer, products, averageRating, reviewCount } =
    useStoreProfile();

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <main className="bg-white mx-auto max-w-6xl shadow-sm overflow-hidden pb-16 md:pb-8">
      <StoreHeader
        farmer={farmer}
        averageRating={averageRating}
        reviewCount={reviewCount}
        onMessage={() => startConversation(farmer)}
      />

      <StoreProducts farmer={farmer} products={products} />
    </main>
  );
}
