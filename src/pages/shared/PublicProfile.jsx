import UnifiedProfilePage from "./UnifiedProfilePage";

/** Compatibility module for old imports; all profile routes share one page. */
export default function PublicProfile() {
  return <UnifiedProfilePage />;
}
