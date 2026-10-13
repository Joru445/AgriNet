import SidePanel from "../../components/auth/SidePanel";
import LoginFormPanel from "../../components/auth/LoginFormPanel";
import { useLoginForm } from "../../hooks/useLoginForm";

export default function Login() {
  const {
    form,
    errors,
    loading,
    passkeyLoading,
    passkeyError,
    socialAuthInFlight,
    savedAccounts,
    hasSavedAccounts,
    viewMode,
    passwordAccount,
    handleChange,
    handleSubmit,
    handleSelectSavedAccount,
    handleSelectSocialAccount,
    handleSelectPasskeyAccount,
    handlePasskeyRetry,
    handleUseAnotherAccount,
    handleBackToSaved,
    initiateSocialLogin,
  } = useLoginForm();

  return (
    <div className="min-h-screen flex">
      <SidePanel />
      <LoginFormPanel
        form={form}
        errors={errors}
        loading={loading}
        passkeyLoading={passkeyLoading}
        passkeyError={passkeyError}
        socialAuthInFlight={socialAuthInFlight}
        savedAccounts={savedAccounts}
        hasSavedAccounts={hasSavedAccounts}
        viewMode={viewMode}
        passwordAccount={passwordAccount}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onSocialLogin={initiateSocialLogin}
        onSelectSavedAccount={handleSelectSavedAccount}
        onSelectSocialAccount={handleSelectSocialAccount}
        onSelectPasskeyAccount={handleSelectPasskeyAccount}
        onPasskeyRetry={handlePasskeyRetry}
        onUseAnotherAccount={handleUseAnotherAccount}
        onBackToSaved={handleBackToSaved}
      />
    </div>
  );
}
