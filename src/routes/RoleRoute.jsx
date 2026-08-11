import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Loading from "../components/Loading";

export default function RoleRoute({ allowedRole }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role !== allowedRole) {
    switch (profile.role) {
      case "admin":
        return <Navigate to="/admin" replace />;

      case "farmer":
        return <Navigate to="/farmer" replace />;

      case "consumer":
        return <Navigate to="/home" replace />;

      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}
