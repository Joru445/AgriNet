import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Loading from "../components/Loading";
import { getRoleHome } from "../utils/routes";

export default function HomeRedirect() {
  const { user, profile, loading, suspended, phoneVerified } = useAuth();

  if (loading) return <Loading />;

  if (!user) return <Navigate to="/landing" replace />;

  if (suspended) {
    return <Navigate to="/suspended" replace />;
  }

  // New Firebase users without an AgriNet profile are sent to the public
  // landing page, never trapped into the registration flow.
  if (!profile) {
    return <Navigate to="/landing" replace />;
  }

  if (!phoneVerified) {
    return <Navigate to="/verify-account" replace />;
  }

  return <Navigate to={getRoleHome(profile?.role)} replace />;
}
