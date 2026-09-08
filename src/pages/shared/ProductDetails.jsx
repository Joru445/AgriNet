import { useState } from "react";
import useProductDetails from "../../hooks/useProductDetails";
import useProductReviews from "../../hooks/useProductReviews";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
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
  const { t } = useLanguage();
  const [showReportModal, setShowReportModal] = useState(false);

  const { loading, product, farmer, refresh } = useProductDetails();
  const { reviews, loading: reviewsLoading } = useProductReviews();

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewCount
      : 0;

  const isOwner = product?.farmerId === profile?.uid;

  if (!loading && (!product || (isProductExpired(product) && !isOwner))) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 pb-24 md:pb-4">
        <EmptyState
          icon="ri-error-warning-line"
          title={t("productDetails.unavailable")}
          description={t("productDetails.unavailableDesc")}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl pb-4">
      {loading ? (
        <ProductDetailsSkeleton />
      ) : (
        <>
          {/* Product Hero: two-column on desktop, equal height */}
          <div className="grid gap-0 lg:grid-cols-2 lg:gap-8">
            {/* LEFT: Gallery — aspect-square on wrapper sets row height on lg */}
            <div className="lg:sticky lg:top-0">
              <ProductGallery product={product} />
            </div>

            {/* RIGHT: grid auto-stretches to match gallery height */}
            <div className="flex flex-col">
              <ProductInfo
                product={product}
                reviewCount={reviewCount}
                averageRating={averageRating}
                isOwner={isOwner}
                onReport={() => setShowReportModal(true)}
              />

              <ProductDescription product={product} />

              <div className="flex-1" />

              <ProductSeller farmer={farmer} isOwner={isOwner} />

              <ProductActions
                product={product}
                farmer={farmer}
                isOwner={isOwner}
                onProductUpdate={refresh}
              />
            </div>
          </div>

          {/* Reviews — below description */}
          <div className="mt-4 sm:mt-6 lg:mt-8 p-4 sm:p-0">
            <ReviewSection
              title={t("reviews.productTitle")}
              reviews={reviews}
              loading={reviewsLoading}
              type="product"
            />
          </div>

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
                    fullname:
                      farmer.fullname || farmer.storeName || t("roles.farmer"),
                    username: farmer.username || "",
                    role: "farmer",
                    email: farmer.email || "",
                  }
                : {
                    uid: product.farmerId,
                    fullname: t("roles.farmer"),
                    role: "farmer",
                  }
            }
          />
        </>
      )}
    </main>
  );
}
