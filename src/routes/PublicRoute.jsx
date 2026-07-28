import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Loading from "../components/Loading";

export default function PublicRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) return <Outlet />;

  if (profile.role === "farmer") return <Navigate to="/farmer" replace />;

  return <Navigate to="/home" replace />;
}
