export default function ReviewTextarea({
  value,
  onChange,
  placeholder,
  disabled = false,
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      rows={4}
      maxLength={500}
      placeholder={placeholder}
      className="
        w-full
        resize-none
        rounded-xl
        border border-gray-200
        bg-white
        px-3
        py-3
        text-sm
        text-gray-900
        placeholder:text-gray-400
        outline-none
        transition
        focus:border-[#2D6A4F]
        focus:ring-2
        focus:ring-[#2D6A4F]/10
        disabled:cursor-not-allowed
        disabled:bg-gray-50
        disabled:text-gray-500
      "
    />
  );
}
