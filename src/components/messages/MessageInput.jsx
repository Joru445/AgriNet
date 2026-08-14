import { useEffect, useRef } from "react";

export default function MessageInput({
  value,
  onChange,
  onSend,
  inquiryProduct,
  onSendInquiry,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);

    const maxHeight = lineHeight * 3 + 24;

    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [value]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="absolute inset-x-0 bottom-0 md:bottom-16 lg:bottom-0 z-40 border-t border-gray-200 bg-white p-3">
      {inquiryProduct && (
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
          {inquiryProduct.images?.[0] && (
            <img
              src={inquiryProduct.images[0].url}
              alt={inquiryProduct.name}
              className="h-12 w-12 shrink-0 rounded-xl object-cover"
            />
          )}

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#2D6A4F]">
              Product Inquiry
            </p>

            <p className="truncate text-sm font-semibold text-gray-900">
              {inquiryProduct.name}
            </p>

            {inquiryProduct.price != null && (
              <p className="text-xs text-gray-500">₱{inquiryProduct.price}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onSendInquiry}
            className="shrink-0 rounded-xl bg-[#2D6A4F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1B4332]"
          >
            Send Inquiry
          </button>
        </div>
      )}

      <div className="flex w-full items-end rounded-3xl border border-gray-200">
        <button
          type="button"
          className="h-12 w-12 shrink-0 rounded-full text-[#2D6A4F] transition hover:text-[#1B4332]"
        >
          <i className="ri-add-large-fill text-lg" />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-w-0 flex-1 resize-none overflow-y-auto scrollbar-none py-3 focus:border-[#2D6A4F] focus:outline-none"
        />

        <button
          type="button"
          onClick={onSend}
          className="h-12 w-12 shrink-0 rounded-2xl text-[#2D6A4F] transition hover:text-[#1B4332]"
        >
          <i className="ri-send-ins-fill text-xl" />
        </button>
      </div>
    </div>
  );
}
