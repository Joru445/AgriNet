export default function StoreAbout({ farmer }) {
  if (!farmer.description?.trim()) return null;

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-[#1B4332] mb-4">
        About the Farm
      </h2>

      <p className="leading-7 text-gray-600 whitespace-pre-wrap">
        {farmer.description}
      </p>
    </section>
  );
}
