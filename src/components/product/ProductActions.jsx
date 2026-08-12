import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import { getMessagesPath } from "../../utils/routes";

export default function ProductActions({ product, farmer }) {
  const { profile } = useAuth();
  const navigate = useNavigate();

  function handleInquiry() {
    navigate(`${getMessagesPath(profile.role)}?user=${farmer.id}`, {
      state: {
        inquiryProduct: product,
      },
    });
  }

  return (
    <section className="sticky bottom-20 lg:bottom-6 bg-white">
      <button
        onClick={handleInquiry}
        className="w-full rounded-2xl bg-[#2D6A4F] py-4 text-white font-semibold hover:bg-[#1B4332] transition"
      >
        <i className="ri-chat-1-line mr-2" />
        Send Inquiry
      </button>
    </section>
  );
}
