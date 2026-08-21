import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getRoleHome } from "../utils/routes";

export default function SuspendedRoute() {
  const { user, profile, loading, suspended } = useAuth();

  if (loading) {
    return null;
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (!suspended) {
    return <Navigate to={getRoleHome(profile.role)} replace />;
  }

  return <Outlet />;
}
