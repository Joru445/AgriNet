import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Loading from "../components/Loading";
import { getRoleHome } from "../utils/routes";

export default function HomeRedirect() {
  const { user, profile, loading, suspended, emailVerified } = useAuth();

  if (loading) return <Loading />;

  if (!user) return <Navigate to="/landing" replace />;

  if (suspended) {
    return <Navigate to="/suspended" replace />;
  }

  if (!emailVerified) {
    return <Navigate to="/verify-account" replace />;
  }

  return <Navigate to={getRoleHome(profile?.role)} replace />;
}
