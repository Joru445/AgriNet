import useProductDetails from "../../hooks/useProductDetails";
import useProductReviews from "../../hooks/useProductReviews";

import { useAuth } from "../../context/AuthContext";

import ProductGallery from "../../components/product/ProductGallery";
import ProductInfo from "../../components/product/ProductInfo";
import ProductSeller from "../../components/product/ProductSeller";
import ProductDescription from "../../components/product/ProductDescription";
import ProductActions from "../../components/product/ProductActions";
import ProductDetailsSkeleton from "../../components/product/ProductDetailsSkeleton";

import ReviewSection from "../../components/reviews/ReviewSection";

export default function ProductDetails() {
  const { loading, product, farmer, reviewCount, averageRating } =
    useProductDetails();

  const { profile } = useAuth();

  const {
    reviews,
    loading: reviewsLoading,
  } = useProductReviews(product?.id);

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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery product={product} />

        <div className="space-y-6">
          <ProductInfo
            product={product}
            reviewCount={reviewCount}
            averageRating={averageRating}
          />

          <ProductSeller farmer={farmer} isOwner={isOwner} />

          <ProductDescription product={product} />

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
    </div>
  );
}
