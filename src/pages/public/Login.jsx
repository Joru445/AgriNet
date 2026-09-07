import SidePanel from "../../components/auth/SidePanel";
import LoginFormPanel from "../../components/auth/LoginFormPanel";
import { useLoginForm } from "../../hooks/useLoginForm";

export default function Login() {
  const {
    form,
    errors,
    loading,
    socialAuthInFlight,
    initiateSocialLogin,
    handleChange,
    handleSubmit,
  } = useLoginForm();

  return (
    <div className="min-h-screen flex">
      <SidePanel />
      <LoginFormPanel
        form={form}
        errors={errors}
        loading={loading}
        socialAuthInFlight={socialAuthInFlight}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onSocialLogin={initiateSocialLogin}
      />
    </div>
  );
}
