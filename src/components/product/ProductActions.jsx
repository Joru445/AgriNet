import { useNavigate } from "react-router-dom";

export default function ProductActions({ product, farmer, isOwner }) {
  const navigate = useNavigate();

  function handleInquiry() {
    navigate(`/messages?user=${farmer.id}`, {
      state: {
        inquiryProduct: product,
      },
    });
  }

  function handleProduct() {
    navigate(`/farmer/products`);
  }

  return (
    <section className="sticky bottom-20 lg:bottom-6 bg-white">
      {isOwner ? (
        <button
          onClick={handleProduct}
          className="w-full rounded-2xl bg-[#2D6A4F] py-4 text-white font-semibold hover:bg-[#1B4332] transition"
        >
          <i className="ri-chat-1-line mr-2" />
          Manage Product
        </button>
      ) : (
        <button
          onClick={handleInquiry}
          className="w-full rounded-2xl bg-[#2D6A4F] py-4 text-white font-semibold hover:bg-[#1B4332] transition"
        >
          <i className="ri-chat-1-line mr-2" />
          Send Inquiry
        </button>
      )}
    </section>
  );
}
