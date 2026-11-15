import { useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import useProducts from "../../hooks/useProducts";
import useSectionPullToRefresh from "../../hooks/useSectionPullToRefresh";
import SectionPullIndicator from "../../components/ui/SectionPullIndicator";

import ProductToolbar from "../../components/farmer/products/ProductToolbar";
import ProductSkeleton from "../../components/products/ProductSkeleton";
import ProductModal from "../../components/farmer/products/ProductModal";
import ProductGrid from "../../components/farmer/products/ProductGrid";
import ProductDrafts from "../../components/farmer/products/ProductDrafts";
import DeleteProductModal from "../../components/farmer/products/DeleteProductModal";
import FirstProductOnboarding from "../../components/onboarding/FirstProductOnboarding";

export default function MyProducts() {
  const { t } = useLanguage();
  const listRef = useRef(null);
  const {
    loading,
    saving,
    products,
    filteredProducts,

    search,
    setSearch,

    view,
    setView,

    showModal,
    showDelete,
    editingProduct,
    activeDraftId,

    drafts,
    loadingDrafts,

    openCreate,
    openEdit,
    openDraft,
    openDelete,
    deleteDraft,
    clearDrafts,
    closeModal,
    closeDelete,

    handleCreate,
    handleUpdate,
    handleDelete,
    reloadProducts,
  } = useProducts();
  const { pullDistance, refreshing } = useSectionPullToRefresh({
    sectionRef: listRef,
    onRefresh: () => reloadProducts(false),
    enabled: !loading && !saving,
  });

  function handleResumeDraft(draft) {
    openDraft(draft);
  }

  async function handleDeleteDraft(draft) {
    if (!window.confirm(t("products.deleteDraftConfirm"))) return;
    await deleteDraft(draft.id);
  }

  async function handleClearDrafts() {
    if (!window.confirm(t("products.clearDraftsConfirm"))) return;
    await clearDrafts();
  }

  return (
    <main className="max-w-7xl mx-auto w-full p-4 md:p-6">
      <ProductToolbar
        search={search}
        onSearch={setSearch}
        view={view}
        onViewChange={setView}
        onAdd={openCreate}
      />

      <div ref={listRef} data-pull-section="farmer-products-list">
      <SectionPullIndicator distance={pullDistance} refreshing={refreshing} />

      <ProductDrafts
        drafts={drafts}
        loading={loadingDrafts}
        onResume={handleResumeDraft}
        onDelete={handleDeleteDraft}
        onClear={handleClearDrafts}
      />

      {loading ? (
        <ProductSkeleton />
      ) : (
        <ProductGrid
          products={filteredProducts}
          view={view}
          onAdd={openCreate}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      )}
      </div>

      <ProductModal
        open={showModal}
        product={editingProduct}
        draftId={activeDraftId}
        saving={saving}
        onClose={closeModal}
        onSubmit={editingProduct ? handleUpdate : handleCreate}
      />

      <DeleteProductModal
        open={showDelete}
        product={editingProduct}
        deleting={saving}
        onCancel={closeDelete}
        onConfirm={handleDelete}
      />

      <FirstProductOnboarding
        hasProducts={products.length > 0}
        loading={loading}
        onCreate={openCreate}
      />
    </main>
  );
}
