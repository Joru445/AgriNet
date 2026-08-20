export default function EmptyProducts() {
  return (
    <div className="py-20 text-center">
      <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-50 flex items-center justify-center">
        <i className="ri-shopping-basket-2-line text-4xl text-[#2D6A4F]" />
      </div>

      <h3 className="text-xl font-bold text-gray-800">No products found</h3>

      <p className="mt-2 text-gray-500">
        Try adjusting your search or filters.
      </p>
    </div>
  );
}
