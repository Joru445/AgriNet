import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Loading from "../components/Loading";
import { getRoleHome } from "../utils/routes";

export default function PublicRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) return <Outlet />;

  return <Navigate to={getRoleHome(profile?.role)} replace />;
}
