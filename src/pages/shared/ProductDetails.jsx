import { useState } from "react";
import useProductDetails from "../../hooks/useProductDetails";
import useProductReviews from "../../hooks/useProductReviews";

import { useAuth } from "../../context/AuthContext";
import { isProductExpired } from "../../utils/productExpiration";

import ProductGallery from "../../components/shared/product/ProductGallery";
import ProductInfo from "../../components/shared/product/ProductInfo";
import ProductSeller from "../../components/shared/product/ProductSeller";
import ProductDescription from "../../components/shared/product/ProductDescription";
import ProductActions from "../../components/shared/product/ProductActions";
import ProductDetailsSkeleton from "../../components/shared/product/ProductDetailsSkeleton";

import ReviewSection from "../../components/common/ReviewSection";
import ReportModal from "../../components/common/ReportModal";

import SkeletonBox from "../../components/common/SkeletonBox"

export default function ProductDetails() {
  const { profile } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);

  const { loading, product, farmer, reviewCount, averageRating } =
    useProductDetails();
  const { reviews, loading: reviewsLoading } = useProductReviews(product?.id);

  const isOwner = product?.farmerId === profile?.uid;

  if (!loading && (!product || (isProductExpired(product) && !isOwner))) {
    return (
      <main className="mx-auto max-w-7xl px-2 py-8 pb-18 md:pb-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <i className="ri-error-warning-line text-5xl text-gray-300 mb-3" />
          <h2 className="text-lg font-bold text-gray-800">Product Unavailable</h2>
          <p className="text-sm text-gray-500 mt-1">
            This listing has ended and is no longer available.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl md:pt-2 pb-8 space-y-4">
      {loading ? (
        <ProductDetailsSkeleton />
      ) : (
        <>
          <div className="grid gap-2 sm:gap-4 lg:grid-cols-2">
            <ProductGallery product={product} />

            <div className="px-2 space-y-1 sm:space-y-4">
              <ProductInfo
                product={product}
                reviewCount={reviewCount}
                averageRating={averageRating}
                isOwner={isOwner}
                onReport={() => setShowReportModal(true)}
              />

              <ProductDescription product={product} />

              <ProductSeller farmer={farmer} isOwner={isOwner} />

              <ProductActions
                product={product}
                farmer={farmer}
                isOwner={isOwner}
              />
            </div>
          </div>

          {/* Reviews */}

          {reviewsLoading ? (
            <SkeletonBox className="w-full h-full" />
          ) : (
            <ReviewSection
              title="Product Reviews"
              reviews={reviews}
              loading={reviewsLoading}
              type="product"
            />
          )}

          {/* Report Product Modal */}
          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            targetType="product"
            targetId={product.id}
            targetTitle={product.name}
            reportedUser={
              farmer
                ? {
                    uid: farmer.uid || farmer.id || product.farmerId,
                    fullname: farmer.fullname || farmer.storeName || "Farmer",
                    username: farmer.username || "",
                    role: "farmer",
                    email: farmer.email || "",
                  }
                : {
                    uid: product.farmerId,
                    fullname: "Farmer",
                    role: "farmer",
                  }
            }
          />
        </>
      )}
    </main>
  );
}
