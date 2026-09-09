/**
 * Shared suspension duration presets.
 *
 * Used by both UserEditModal (admin users page) and
 * ReportDetailsModal (admin reports page suspension action).
 */
export const DURATION_OPTIONS = [
  { value: "1d", labelKey: "farmerVerification.duration1d" },
  { value: "3d", labelKey: "farmerVerification.duration3d" },
  { value: "7d", labelKey: "farmerVerification.duration7d" },
  { value: "14d", labelKey: "farmerVerification.duration14d" },
  { value: "30d", labelKey: "farmerVerification.duration30d" },
  { value: "permanent", labelKey: "farmerVerification.durationPermanent" },
];
