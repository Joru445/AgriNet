import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Loading from "../components/Loading";
import { getRoleHome } from "../utils/routes";

export default function PublicRoute() {
  const { user, profile, loading, suspended, phoneVerified } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;

  if (!user) return <Outlet />;

  if (suspended) {
    return <Navigate to="/suspended" replace />;
  }

  if (!phoneVerified) {
    return <Navigate to="/verify-account" replace />;
  }

  const from = location.state?.from;
  if (from) {
    const pathname = typeof from === "string" ? from : from.pathname || "";
    const search = typeof from === "object" && from.search ? from.search : "";
    const hash = typeof from === "object" && from.hash ? from.hash : "";

    const publicRoutes = ["/login", "/register", "/forgot-password", "/landing", "/suspended", "/"];
    if (!publicRoutes.includes(pathname) && pathname.startsWith("/")) {
      const role = profile?.role;
      const isAdminRoute = pathname.startsWith("/admin");
      const isFarmerRoute = pathname.startsWith("/farmer");
      const isConsumerRoute = !isAdminRoute && !isFarmerRoute;

      if (
        (role === "admin" && isAdminRoute) ||
        (role === "farmer" && isFarmerRoute) ||
        (role === "consumer" && isConsumerRoute)
      ) {
        return <Navigate to={`${pathname}${search}${hash}`} replace />;
      }
    }
  }

  return <Navigate to={getRoleHome(profile?.role)} replace />;
}
