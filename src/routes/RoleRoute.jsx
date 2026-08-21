import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Loading from "../components/Loading";

export default function RoleRoute({ allowedRole }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  // Suspended users cannot access normal application routes.
  if (profile.status === "suspended") {
    return <Navigate to="/suspended" replace />;
  }

  // Redirect users who try to access another role's routes.
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
