export default function ProductPagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="w-10 h-10 rounded-xl border disabled:opacity-40"
      >
        <i className="ri-arrow-left-s-line" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
        <button
          key={number}
          onClick={() => onChange(number)}
          className={`w-10 h-10 rounded-xl font-semibold ${
            page === number ? "bg-[#2D6A4F] text-white" : "border"
          }`}
        >
          {number}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="w-10 h-10 rounded-xl border disabled:opacity-40"
      >
        <i className="ri-arrow-right-s-line" />
      </button>
    </div>
  );
}
