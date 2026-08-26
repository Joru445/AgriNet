import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { register } from "../services/register.service";

import { showToast } from "../utils/toast";

const INITIAL_FORM = {
  role: "consumer",

  fullname: "",
  username: "",

  email: "",

  password: "",
  confirmPassword: "",

  contactNumber: "",

  bio: "",

  location: {
    address: "",
    lat: null,
    lng: null,
  },
};

export default function useRegisterForm() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function updateLocation(location) {
    setForm((prev) => ({
      ...prev,
      location,
    }));
  }

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, 3));
  }

  function previousStep() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function submit() {
    if (
      form.role === "farmer" &&
      (!form.location?.lat || !form.location?.lng)
    ) {
      showToast.error("Please select your farm location.");
      return;
    }

    try {
      setLoading(true);

      await register(form);

      showToast.success("Account created! Please check your inbox or spam folder to verify your account.");

      navigate("/verify-account", { replace: true });
    } catch (error) {
      console.error(error);
      showToast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    step,

    loading,

    form,

    showPassword,

    updateField,
    updateLocation,

    nextStep,
    previousStep,

    submit,

    setShowPassword,
  };
}
