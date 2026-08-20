export default function ProductDescription({ product }) {
  return (
    <section className="rounded-2xl border border-gray-200 p-6">
      <h2 className="font-semibold text-lg mb-3">Description</h2>

      <p className="leading-7 text-gray-600 whitespace-pre-wrap">
        {product.description || "No description provided."}
      </p>
    </section>
  );
}
