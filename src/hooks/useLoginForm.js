import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { login } from "../services/login.service";
import { getRoleHome } from "../utils/routes";
import { validateLoginForm } from "../utils/validators";

const EMPTY_ERRORS = { email: "", password: "", general: "" };

export function useLoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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

      const { user, profile } = await login(form);

      if (!profile?.role) {
        setErrors({
          ...EMPTY_ERRORS,
          general: "Unable to determine your account role.",
        });
        return;
      }

      if (profile.status === "suspended") {
        navigate("/suspended", { replace: true });
        return;
      }

      if (!user?.emailVerified) {
        navigate("/verify-account", { replace: true });
        return;
      }

      const from = location.state?.from;
      let targetPath = null;

      if (from) {
        const pathname = typeof from === "string" ? from : from.pathname || "";
        const search = typeof from === "object" && from.search ? from.search : "";
        const hash = typeof from === "object" && from.hash ? from.hash : "";

        const publicRoutes = ["/login", "/register", "/forgot-password", "/landing", "/suspended", "/"];
        if (!publicRoutes.includes(pathname) && pathname.startsWith("/")) {
          const role = profile.role;
          const isAdminRoute = pathname.startsWith("/admin");
          const isFarmerRoute = pathname.startsWith("/farmer");
          const isConsumerRoute = !isAdminRoute && !isFarmerRoute;

          if (
            (role === "admin" && isAdminRoute) ||
            (role === "farmer" && isFarmerRoute) ||
            (role === "consumer" && isConsumerRoute)
          ) {
            targetPath = `${pathname}${search}${hash}`;
          }
        }
      }

      navigate(targetPath || getRoleHome(profile.role), { replace: true });
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
