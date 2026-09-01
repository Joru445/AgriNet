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
import EmptyState from "../../components/ui/EmptyState";

export default function ProductDetails() {
  const { profile } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);

  const { loading, product, farmer, reviewCount, averageRating } =
    useProductDetails();
  const { reviews, loading: reviewsLoading } = useProductReviews();

  const isOwner = product?.farmerId === profile?.uid;

  if (!loading && (!product || (isProductExpired(product) && !isOwner))) {
    return (
      <main className="mx-auto max-w-7xl px-2 py-8 pb-18 md:pb-4">
        <EmptyState
          icon="ri-error-warning-line"
          title="Product Unavailable"
          description="This listing has ended and is no longer available."
        />
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

          {/* Reviews - loads independently */}

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
