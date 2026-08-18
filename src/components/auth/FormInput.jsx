export default function FormInput({
  label,
  name,
  type = "text",
  icon,
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
}) {
  return (
    <div>
      <label className="block mb-2 font-medium text-[#16352A]">{label}</label>

      <div className="relative">
        {icon && (
          <i
            className={`${icon} absolute left-4 top-1/2 -translate-y-1/2 text-[#16352A]/50 text-sm`}
          ></i>
        )}

        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className={`
            w-full rounded-xl border py-3 ${icon ? "pl-11 pr-4" : "px-4"}
            focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]
            ${error ? "border-red-500" : "border-gray-300"}
          `}
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
