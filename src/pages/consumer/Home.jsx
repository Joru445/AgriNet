import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useHomeProducts from "../../hooks/useHomeProducts";

import NearYouSection from "../../components/consumer/home/NearYouSection";
import RecentProductsSection from "../../components/consumer/home/RecentProductsSection";
import RelevantProductsSection from "../../components/consumer/home/RelevantProductsSection";

import SearchBar from "../../components/consumer/marketplace/SearchBar";
import CategoryChips from "../../components/consumer/home/CategoryChips";

export default function Home() {
  const {
    loading,
    nearbyProducts,
    recentProducts,
    relevantProducts,
    userLocation,
  } = useHomeProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(value) {
    const trimmed = value.trim();

    navigate(
      trimmed
        ? `/marketplace?search=${encodeURIComponent(trimmed)}`
        : "/marketplace",
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 pb-18 md:pb-8 space-y-8">
      {loading ? (
        <div className="space-y-8">
          {/* Add Home-specific section skeletons here */}
        </div>
      ) : (
        <>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
          />

          <CategoryChips />
          <NearYouSection
            products={nearbyProducts}
            userLocation={userLocation}
          />

          <RecentProductsSection products={recentProducts} />

          <RelevantProductsSection products={relevantProducts} />
        </>
      )}
    </main>
  );
}
