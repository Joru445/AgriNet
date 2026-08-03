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
    <div className="grid grid-cols-1 p-6 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {farmers.map((farmer) => (
        <NearbyFarmerCard key={farmer.uid} farmer={farmer} />
      ))}
    </div>
  );
}
