import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../services/login.service";
import { getRoleHome } from "../utils/routes";
import { validateLoginForm } from "../utils/validators";

const EMPTY_ERRORS = { email: "", password: "", general: "" };

export function useLoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation runs before we ever hit the network.
    const validationErrors = validateLoginForm(form);
    if (validationErrors.email || validationErrors.password) {
      setErrors(validationErrors);
      return;
    }

    setErrors(EMPTY_ERRORS);

    try {
      setLoading(true);

      const { profile } = await login(form);

      if (!profile?.role) {
        setErrors({
          ...EMPTY_ERRORS,
          general: "Unable to determine your account role.",
        });
        return;
      }

      navigate(getRoleHome(profile.role));
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/invalid-credential":
          setErrors({
            ...EMPTY_ERRORS,
            password: "Invalid email or password.",
          });
          break;

        case "auth/too-many-requests":
          setErrors({
            ...EMPTY_ERRORS,
            password: "Too many login attempts. Please try again later.",
          });
          break;

        default:
          setErrors({
            ...EMPTY_ERRORS,
            general: "Unable to sign in. Please try again.",
          });
      }
    } finally {
      setLoading(false);
    }
  };

  return { form, errors, loading, handleChange, handleSubmit };
}
