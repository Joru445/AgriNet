export default function ProductDescription({ product }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <h2 className="font-bold text-lg text-gray-900 mb-2">Description</h2>

      <p className="leading-relaxed text-sm sm:text-base text-gray-600 whitespace-pre-wrap font-normal">
        {product.description || "No description provided."}
      </p>
    </section>
  );
}
