import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useHomeProducts from "../../hooks/useHomeProducts";

import {
  NearYouSkeleton,
  RecentProductsSkeleton,
  RelevantProductsSkeleton,
} from "../../components/consumer/home/SectionSkeletons";

import NearYouSection from "../../components/consumer/home/NearYouSection";
import RecentProductsSection from "../../components/consumer/home/RecentProductsSection";
import RelevantProductsSection from "../../components/consumer/home/RelevantProductsSection";

import CategoryChips from "../../components/consumer/layout/CategoryChips";
import MarketplaceSubHeader from "../../components/consumer/layout/MarketplaceSubHeader";

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
    <main className="max-w-6xl mx-auto pb-8 space-y-4">
      <MarketplaceSubHeader
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
      />

      <CategoryChips />
      {loading ? (
        <div className="space-y-8">
          <NearYouSkeleton />
          <RecentProductsSkeleton />
          <RelevantProductsSkeleton />
        </div>
      ) : (
        <div className="px-2 sm:px-4 space-y-8">
          <NearYouSection
            products={nearbyProducts}
            userLocation={userLocation}
          />

          <RecentProductsSection products={recentProducts} />

          <RelevantProductsSection products={relevantProducts} />
        </div>
      )}
    </main>
  );
}
