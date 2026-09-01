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
        border border-[var(--agri-input-border)]
        bg-[var(--agri-input-bg)]
        px-3
        py-3
        text-sm
        text-[var(--agri-text)]
        placeholder:text-[var(--agri-text-muted)]
        outline-none
        transition
        focus:border-[#2D6A4F]
        focus:ring-2
        focus:ring-[#2D6A4F]/10
        disabled:cursor-not-allowed
        disabled:bg-[var(--agri-hover)]
        disabled:text-[var(--agri-text-muted)]
      "
    />
  );
}
