export default function EmptyProducts({ onAdd }) {
  return (
    <div className="bg-[var(--agri-card)] border border-dashed border-[var(--agri-border)] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
      <div className="w-18 h-18 rounded-full bg-green-50 flex items-center justify-center mb-5">
        <i className="ri-store-2-line text-4xl text-[#2D6A4F]" />
      </div>

      <h3 className="text-xl font-semibold text-[var(--agri-text)]">No products yet</h3>

      <p className="mt-2 max-w-sm text-sm text-[var(--agri-text-muted)]">
        Start selling by adding your first agricultural product. Your listings
        will appear in the marketplace once published.
      </p>

      <button
        onClick={onAdd}
        className="mt-6 flex items-center gap-2 px-5 py-3 bg-[#2D6A4F] hover:bg-[#1B4332] rounded-xl text-white font-medium transition-colors cursor-pointer"
      >
        <i className="ri-add-line" />
        Add Product
      </button>
    </div>
  );
}
