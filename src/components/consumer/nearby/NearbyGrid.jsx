import EmptyNearby from "./EmptyNearby";
import NearbyFarmerCard from "./NearbyFarmerCard";

export default function NearbyFarmerGrid({ loading, farmers }) {
  if (loading) {
    return (
      <div className="py-20 text-center">
        <i className="ri-loader-4-line animate-spin text-3xl text-[#2D6A4F]" />
      </div>
    );
  }

  if (!farmers.length) {
    return <EmptyNearby />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 p-3 sm:p-4 md:p-6">
      {farmers.map((farmer) => (
        <NearbyFarmerCard key={farmer.uid} farmer={farmer} />
      ))}
    </div>
  );
}
