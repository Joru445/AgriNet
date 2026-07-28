export default function MessageInput({ value, onChange, onSend }) {
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-3">
        <textarea
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-[#2D6A4F]"
        />

        <button
          onClick={onSend}
          className="w-12 h-12 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white transition"
        >
          <i className="ri-send-plane-fill text-lg" />
        </button>
      </div>
    </div>
  );
}
