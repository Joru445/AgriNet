import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

export default function VerificationRoute() {
  const { user, profile, loading, suspended, emailVerified } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!user || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Suspended users always go to /suspended first
  if (suspended) {
    return <Navigate to="/suspended" replace />;
  }

  // Email verification check
  if (!emailVerified) {
    return <Navigate to="/verify-account" replace />;
  }

  return <Outlet />;
}

