import { useState } from "react";

export default function PasswordInput({ label, name, value, onChange, error }) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="block mb-2 font-medium text-gray-700">{label}</label>

      <div className="relative">
        <i
          className="ri-lock-line absolute left-4 top-1/2 -translate-y-1/2 text-[#16352A]/50 text-sm"
        ></i>
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          className={`
            w-full rounded-xl border px-4 py-3 pr-12 pl-11
            focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] text-gray-950
            ${error ? "border-red-500" : "border-gray-300"}
          `}
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
        >
          <i className={show ? "ri-eye-off-line" : "ri-eye-line"} />
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
