import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getPublicProfilePath } from "../../utils/routes";
import LoginRequired from "../../components/ui/LoginRequired";
import PublicProfileSkeleton from "../../components/profile/PublicProfileSkeleton";

/** `/me` is compatibility-only; the owner edits from the canonical profile. */
export default function OwnProfileRedirect() {
  const { user, profile, authInitializing } = useAuth();
  if (authInitializing) return <PublicProfileSkeleton />;
  if (!user) return <LoginRequired title="Profile" />;
  return <Navigate replace to={getPublicProfilePath(profile || { uid: user.uid })} />;
}
