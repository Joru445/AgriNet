
import useRegisterForm from "../../hooks/useRegisterForm";

import SidePanel from "../../components/auth/SidePanel";
import RegisterForm from "../../components/auth/RegisterFormPanel";

export default function Register() {
  const {
    step,
    loading,
    form,

    updateField,
    updateLocation,

    nextStep,
    previousStep,

    submit,
  } = useRegisterForm();

  return (
    <div className="min-h-screen flex">
      <SidePanel step={step} />

      <RegisterForm
        step={step}
        form={form}
        loading={loading}
        updateField={updateField}
        updateLocation={updateLocation}
        nextStep={nextStep}
        previousStep={previousStep}
        submit={submit}
      />
    </div>
  );
}
