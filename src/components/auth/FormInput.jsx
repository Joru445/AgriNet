import {
  authFieldErrorClass,
  authInputBaseClass,
  authInputErrorClass,
  authInputIconClass,
  authInputNormalClass,
  authLabelClass,
} from "./authStyles";

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
      <label className={authLabelClass}>{label}</label>

      <div className="relative">
        {icon && (
          <i className={`${icon} ${authInputIconClass}`}></i>
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
            ${authInputBaseClass}
            ${icon ? "pl-10 pr-3" : "px-3"}
            ${error ? authInputErrorClass : authInputNormalClass}
          `}
        />
      </div>

      {error && (
        <p className={authFieldErrorClass}>
          <i className="ri-error-warning-line text-xs" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}