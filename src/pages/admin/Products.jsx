import { useState, useCallback } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { showToast } from "../../utils/toast";

import useAdminProducts from "../../hooks/useAdminProducts";

import ProductHeader from "../../components/admin/products/ProductHeader";
import ProductStats from "../../components/admin/products/ProductStats";
import ProductFilters from "../../components/admin/products/ProductFilters";
import ProductTable from "../../components/admin/products/ProductTable";
import ProductTableSkeleton from "../../components/admin/products/ProductTableSkeleton";
import ProductDetailModal from "../../components/admin/products/ProductDetailModal";
import Alert from "../../components/ui/Alert";

export default function Products() {
  const { t } = useLanguage();
  const {
    products,
    pagination,
    loading,
    error,
    actionLoading,
    search,
    setSearch,
    category,
    setCategory,
    sellingMode,
    setSellingMode,
    available,
    setAvailable,
    reported,
    setReported,
    stats,
    toggleAvailability,
    setPage,
  } = useAdminProducts();

  const [selectedProductId, setSelectedProductId] = useState(null);

  const handleView = useCallback((product) => {
    setSelectedProductId(product.id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedProductId(null);
  }, []);

  const handleToggleAvailability = useCallback(async (productId, newAvailable) => {
    try {
      await toggleAvailability(productId, newAvailable);
      showToast.success(
        newAvailable
          ? t("adminProduct.productEnabled")
          : t("adminProduct.productDisabled"),
      );
    } catch {
      showToast.error(t("adminProduct.failedToUpdate"));
    }
  }, [toggleAvailability, t]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, [setPage]);

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <ProductHeader />

        <ProductStats stats={stats} />

        <ProductFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          sellingMode={sellingMode}
          onSellingModeChange={setSellingMode}
          available={available}
          onAvailableChange={setAvailable}
          reported={reported}
          onReportedChange={setReported}
        />

        {error && (
          <Alert variant="error" message={error} className="mb-6" />
        )}

        {loading ? (
          <ProductTableSkeleton />
        ) : (
          <ProductTable
            products={products}
            onView={handleView}
            onToggleAvailability={handleToggleAvailability}
            actionLoading={actionLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {selectedProductId && (
        <ProductDetailModal
          productId={selectedProductId}
          onClose={handleCloseDetail}
          onToggleAvailability={handleToggleAvailability}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}
