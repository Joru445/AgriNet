import useProducts from "../../hooks/useProducts";

import ProductToolbar from "../../components/farmer/products/ProductToolbar";
import ProductSkeleton from "../../components/shared/product/ProductSkeleton";
import ProductModal from "../../components/farmer/products/ProductModal";
import ProductGrid from "../../components/farmer/products/ProductGrid";
import DeleteProductModal from "../../components/farmer/products/DeleteProductModal";
import FirstProductOnboarding from "../../components/onboarding/FirstProductOnboarding";

export default function MyProducts() {
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

    openCreate,
    openEdit,
    openDelete,
    closeModal,
    closeDelete,

    handleCreate,
    handleUpdate,
    handleDelete,
  } = useProducts();

  return (
    <main className="flex-1 p-4 md:p-6 pb-16 md:pb-0">
      <ProductToolbar
        search={search}
        onSearch={setSearch}
        view={view}
        onViewChange={setView}
        onAdd={openCreate}
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

      <ProductModal
        open={showModal}
        product={editingProduct}
        saving={saving}
        onClose={closeModal}
        onSubmit={editingProduct ? handleUpdate : handleCreate}
      />

      <DeleteProductModal
        open={showDelete}
        product={editingProduct}
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
