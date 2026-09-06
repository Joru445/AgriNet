import useRegisterForm from "../../hooks/useRegisterForm";

import SidePanel from "../../components/auth/SidePanel";
import RegisterForm from "../../components/auth/RegisterFormPanel";

export default function Register() {
  const registerFormState = useRegisterForm();

  return (
    <div className="min-h-screen h-screen w-full flex">
      <SidePanel
        step={
          registerFormState.registrationMethod
            ? registerFormState.step
            : null
        }
      />

      <RegisterForm {...registerFormState} />
    </div>
  );
}
