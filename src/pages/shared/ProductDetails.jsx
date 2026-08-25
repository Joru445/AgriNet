import { useState } from "react";
import useProductDetails from "../../hooks/useProductDetails";
import useProductReviews from "../../hooks/useProductReviews";

import { useAuth } from "../../context/AuthContext";

import ProductGallery from "../../components/shared/product/ProductGallery";
import ProductInfo from "../../components/shared/product/ProductInfo";
import ProductSeller from "../../components/shared/product/ProductSeller";
import ProductDescription from "../../components/shared/product/ProductDescription";
import ProductActions from "../../components/shared/product/ProductActions";
import ProductDetailsSkeleton from "../../components/shared/product/ProductDetailsSkeleton";

import ReviewSection from "../../components/common/ReviewSection";
import ReportModal from "../../components/common/ReportModal";

export default function ProductDetails() {
  const { profile } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);

  const { loading, product, farmer, reviewCount, averageRating } = useProductDetails();

  const { reviews, loading: reviewsLoading } = useProductReviews(product?.id);

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">Product not found.</div>
    );
  }

  const isOwner = product.farmerId === profile?.uid;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-18 md:pb-4">
      <div className="grid gap-8 lg:grid-cols-2 mb-4">
        <ProductGallery product={product} />

        <div className="space-y-6">
          <ProductInfo
            product={product}
            reviewCount={reviewCount}
            averageRating={averageRating}
            isOwner={isOwner}
            onReport={() => setShowReportModal(true)}
          />

          <ProductDescription product={product} />

          <ProductSeller farmer={farmer} isOwner={isOwner} />

          <ProductActions product={product} farmer={farmer} isOwner={isOwner} />
        </div>
      </div>

      {/* Reviews */}
      <ReviewSection
        title="Product Reviews"
        reviews={reviews}
        loading={reviewsLoading}
        type="product"
      />

      {/* Report Product Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="product"
        targetId={product.id}
        targetTitle={product.name}
        reportedUser={farmer ? {
          uid: farmer.uid || farmer.id || product.farmerId,
          fullname: farmer.fullname || farmer.storeName || "Farmer",
          username: farmer.username || "",
          role: "farmer",
          email: farmer.email || "",
        } : {
          uid: product.farmerId,
          fullname: "Farmer",
          role: "farmer",
        }}
      />
    </div>
  );
}
