import useProducts from "../../hooks/useProducts";

import ProductToolbar from "../../components/products/ProductToolbar";
import ProductSkeleton from "../../components/products/ProductSkeleton";
import ProductModal from "../../components/products/ProductModal";
import ProductGrid from "../../components/products/ProductGrid";
import DeleteProductModal from "../../components/products/DeleteProductModal";

export default function MyProducts() {
  const {
    loading,
    saving,
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
    <main className="flex-1 p-4 md:p-6">
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
    </main>
  );
}
