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
        border border-(--agri-input-border)
        bg-(--agri-input-bg)
        px-3
        py-3
        text-sm
        text-(--agri-text)
        placeholder:text-(--agri-text-muted)
        outline-none
        transition
        focus:border-[#2D6A4F]
        focus:ring-2
        focus:ring-[#2D6A4F]/10
        disabled:cursor-not-allowed
        disabled:bg-(--agri-hover)
        disabled:text-(--agri-text-muted)
      "
    />
  );
}
