import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Loading from "../components/Loading";

export default function RoleRoute({ allowedRole }) {
  const { user, profile, loading, suspended, phoneVerified } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!user || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Suspended users cannot access normal application routes.
  if (suspended) {
    return <Navigate to="/suspended" replace />;
  }

  // Phone verification is REQUIRED to access the application.
  if (!phoneVerified) {
    return <Navigate to="/verify-account" replace />;
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
