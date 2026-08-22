import { useEffect, useRef, useState } from "react";

export default function MessageInput({
  value,
  onChange,
  onSend,
  inquiryProduct,
  onSendInquiry,
}) {
  const textareaRef = useRef(null);

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);

    const maxHeight = lineHeight * 3 + 24;

    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [value]);

  /*
   * Reset the inquiry quantity whenever
   * the selected inquiry product changes.
   */
  useEffect(() => {
    setQuantity(1);
  }, [inquiryProduct?.id]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => {
      const currentQuantity = Number(current);

      if (!Number.isInteger(currentQuantity)) {
        return 1;
      }

      if (hasStock) {
        return Math.min(stock, currentQuantity + 1);
      }

      return currentQuantity + 1;
    });
  }

  function handleQuantityChange(e) {
    const value = e.target.value;

    if (value === "") {
      setQuantity("");
      return;
    }

    const nextQuantity = Number(value);

    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      return;
    }

    if (hasStock) {
      setQuantity(Math.min(nextQuantity, stock));

      return;
    }

    setQuantity(nextQuantity);
  }

  function handleSendInquiry() {
    const finalQuantity = Number(quantity);

    if (!Number.isInteger(finalQuantity) || finalQuantity < 1) {
      return;
    }

    onSendInquiry(finalQuantity);
  }

  const stock = Number(inquiryProduct?.stock);

  const isAvailable = inquiryProduct?.available === true;

  const hasStock = Number.isInteger(stock) && stock > 0;

  const isMaxQuantity = hasStock && Number(quantity) >= stock;

  return (
    <div className="shrink-0 w-full border-t p-3 bg-[#FAFAFA] border-[#DDD] z-10">
      {inquiryProduct && (
        <div
          className="mb-3 rounded-2xl border p-3"
          style={{
            backgroundColor: "var(--agri-bg-surface)",
            borderColor: "var(--agri-border)",
          }}
        >
          <div className="flex items-center gap-3">
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
                <p className="text-xs text-gray-500">
                  ₱{inquiryProduct.price}
                  {inquiryProduct.unit ? ` / ${inquiryProduct.unit}` : ""}
                </p>
              )}

              {isAvailable && hasStock && (
                <p className="mt-0.5 text-xs text-gray-400">
                  {stock} {inquiryProduct.unit || "available"} available
                </p>
              )}
            </div>
          </div>

          {/* Quantity + Send */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-600">
                Quantity
              </p>

              <div className="flex h-10 items-center rounded-xl border border-gray-200 bg-black">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={Number(quantity) <= 1}
                  className="
                    flex h-full w-10 items-center
                    justify-center
                    text-gray-500
                    transition
                    hover:text-[#2D6A4F]
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                  aria-label="Decrease quantity"
                >
                  <i className="ri-subtract-line" />
                </button>

                <input
                  type="number"
                  min="1"
                  max={hasStock ? stock : undefined}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="
                    h-full w-14
                    border-x border-gray-100
                    bg-transparent
                    text-center text-sm
                    font-semibold text-gray-900
                    outline-none
                  "
                  aria-label="Inquiry quantity"
                />

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={isMaxQuantity}
                  className="
                    flex h-full w-10 items-center
                    justify-center
                    text-gray-500
                    transition
                    hover:text-[#2D6A4F]
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                  aria-label="Increase quantity"
                >
                  <i className="ri-add-line" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendInquiry}
              disabled={
                !isAvailable ||
                !hasStock ||
                !Number.isInteger(Number(quantity)) ||
                Number(quantity) < 1
              }
              className="
                shrink-0 rounded-xl
                bg-[#2D6A4F]
                px-4 py-2.5
                text-sm font-medium text-white
                transition
                hover:bg-[#1B4332]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {!isAvailable ? "Unavailable" : "Send Inquiry"}
            </button>
          </div>
        </div>
      )}

      <div className="flex w-full items-end rounded-2xl border overflow-hidden bg-[#FAFAFA] border-[#DDDDDD]">
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
          className="min-w-0 flex-1 resize-none overflow-y-auto py-3 focus:border-[#2D6A4F] focus:outline-none"
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
