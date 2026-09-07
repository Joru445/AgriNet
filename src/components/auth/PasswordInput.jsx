import { useState } from "react";

import {
  authFieldErrorClass,
  authInputBaseClass,
  authInputErrorClass,
  authInputIconClass,
  authInputNormalClass,
  authLabelClass,
} from "./authStyles";

export default function PasswordInput({ label, name, value, onChange, error }) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className={authLabelClass}>{label}</label>

      <div className="relative">
        <i className={`ri-lock-line ${authInputIconClass}`}></i>
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          className={`
            ${authInputBaseClass}
            pl-10 pr-12
            ${error ? authInputErrorClass : authInputNormalClass}
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

      {error && (
        <p className={authFieldErrorClass}>
          <i className="ri-error-warning-line text-xs" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}