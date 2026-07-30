export default function RoleSelector({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        I am a...
      </label>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange("consumer")}
          className={`flex flex-col rounded-xl items-center border-2 p-4 transition ${
            value === "consumer"
              ? "border-[#2D6A4F] bg-green-50"
              : "border-gray-300"
          }`}
        >
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full ${
              value === "consumer" ? "bg-[#2D6A4F]" : "bg-gray-100"
            }`}
          >
            <i
              className={`ri-shopping-basket-line ${
                value === "consumer" ? "text-white" : "text-gray-500"
              }`}
            ></i>
          </div>

          <div className="mt-2 font-semibold">Consumer</div>

          <div className="text-sm text-gray-500">Buy local products</div>
        </button>

        <button
          type="button"
          onClick={() => onChange("farmer")}
          className={`flex flex-col rounded-xl items-center border-2 p-4 transition ${
            value === "farmer"
              ? "border-[#2D6A4F] bg-green-50"
              : "border-gray-300"
          }`}
        >
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full ${
              value === "farmer" ? "bg-[#2D6A4F]" : "bg-gray-100"
            }`}
          >
            <i
              className={`ri-plant-line ${
                value === "farmer" ? "text-white" : "text-gray-500"
              }`}
            ></i>
          </div>

          <div className="mt-2 font-semibold">Farmer</div>

          <div className="text-sm text-gray-500">Sell your harvest</div>
        </button>
      </div>
    </div>
  );
}
