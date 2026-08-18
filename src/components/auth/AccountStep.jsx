import { showToast } from "../../utils/toast";

import RoleSelector from "./RoleSelector";

export default function AccountStep({ form, updateField, onContinue }) {
  function handleContinue() {
    if (!form.fullname.trim()) {
      showToast.error("Please enter your full name.");
      return;
    }

    if (!form.username.trim()) {
      showToast.error("Please enter a username.");
      return;
    }

    if (!form.email.trim()) {
      showToast.error("Please enter your email.");
      return;
    }

    onContinue();
  }

  return (
    <div className="space-y-4 w-full">
      <RoleSelector
        value={form.role}
        onChange={(role) => updateField("role", role)}
      />

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Full Name
        </label>

        <div className="relative">
          <i className="ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            value={form.fullname}
            placeholder="Juan dela Cruz"
            onChange={(e) => updateField("fullname", e.target.value)}
            className="w-full pl-8 pr-10 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2D6A4F] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Username
        </label>

        <div className="relative">
          <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            @
          </i>
          <input
            value={form.username}
            placeholder="juan123"
            onChange={(e) => updateField("username", e.target.value)}
            className="w-full pl-8 pr-10 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2D6A4F] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Email
        </label>

        <div className="relative">
          <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="email"
            value={form.email}
            placeholder="juan@gmail.com"
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full pl-8 pr-10 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2D6A4F] transition-colors"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        className="w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
      >
        Continue
      </button>

    </div>
  );
}
