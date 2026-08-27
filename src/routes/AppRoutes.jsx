import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import HomeRedirect from "./HomeRedirect";
import PublicRoute from "./PublicRoute";
import RoleRoute from "./RoleRoute";
import SuspendedRoute from "./SuspendedRoute";
import VerificationRoute from "./VerificationRoute";

import PublicLayout from "../layouts/PublicLayout";
import AppLayout from "../layouts/AppLayout";

// Public Pages
const Landing = lazy(() => import("../pages/public/Landing"));
const Login = lazy(() => import("../pages/public/Login"));
const Register = lazy(() => import("../pages/public/Register"));
const ForgotPassword = lazy(() => import("../pages/public/ForgotPassword"));
const VerifyAccount = lazy(() => import("../pages/public/VerifyAccount"));

// Suspended Page
const Suspended = lazy(() => import("../pages/Suspended.jsx"));

// Consumer Pages
const ConsumerHome = lazy(() => import("../pages/consumer/Home"));
const Nearby = lazy(() => import("../pages/consumer/Nearby"));

// Farmer Pages
const FarmerDashboard = lazy(() => import("../pages/farmer/Dashboard"));
const MyProducts = lazy(() => import("../pages/farmer/MyProducts"));
const Reviews = lazy(() => import("../pages/farmer/Reviews"));

// Admin Pages
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
const Users = lazy(() => import("../pages/admin/Users"));
const Reports = lazy(() => import("../pages/admin/Reports.jsx"));

// Shared Pages
const ProductDetails = lazy(() => import("../pages/shared/ProductDetails"));
const StoreProfile = lazy(() => import("../pages/shared/StoreProfile"));
const Inquiries = lazy(() => import("../pages/shared/Inquiries"));
const TransactionProof = lazy(() => import("../pages/shared/TransactionProof"));
const TransactionReview = lazy(() => import("../pages/shared/TransactionReview"));
const Messages = lazy(() => import("../pages/shared/Messages"));
const Profile = lazy(() => import("../pages/shared/Profile"));
const Notifications = lazy(() => import("../pages/shared/Notifications"));
const NotFound = lazy(() => import("../pages/NotFound"));

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* ROOT */}

        <Route path="/" element={<HomeRedirect />} />

        <Route element={<SuspendedRoute />}>
          <Route path="/suspended" element={<Suspended />} />
        </Route>

        <Route path="/verify-account" element={<VerifyAccount />} />

        {/* PUBLIC */}

        <Route element={<PublicRoute />}>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/landing" element={<Landing />} />
          </Route>
        </Route>

        {/* VERIFICATION GATE FOR PROTECTED ROUTES */}

        <Route element={<VerificationRoute />}>
          {/* CONSUMER */}

          <Route element={<RoleRoute allowedRole="consumer" />}>
            <Route element={<AppLayout />}>
              <Route path="/home" element={<ConsumerHome />} />

              <Route path="/nearby" element={<Nearby />} />

              <Route path="/product/:id" element={<ProductDetails />} />

              <Route path="/profile/:uid" element={<StoreProfile />} />

              <Route path="/inquiries" element={<Inquiries />} />

              <Route
                path="/inquiries/:inquiryId/proof"
                element={<TransactionProof />}
              />

              <Route
                path="/inquiries/:inquiryId/review"
                element={<TransactionReview />}
              />

              <Route path="/messages" element={<Messages />} />

              <Route path="/me" element={<Profile />} />

              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* FARMER */}

          <Route element={<RoleRoute allowedRole="farmer" />}>
            <Route element={<AppLayout />}>
              <Route path="/farmer" element={<FarmerDashboard />} />

              <Route path="/farmer/product/:id" element={<ProductDetails />} />

              <Route path="/farmer/products" element={<MyProducts />} />

              <Route path="/farmer/profile/:uid" element={<StoreProfile />} />

              <Route path="/farmer/inquiries" element={<Inquiries />} />

              <Route
                path="/farmer/inquiries/:inquiryId/proof"
                element={<TransactionProof />}
              />

              <Route
                path="/farmer/inquiries/:inquiryId/review"
                element={<TransactionReview />}
              />

              <Route path="/farmer/reviews" element={<Reviews />} />

              <Route path="/farmer/messages" element={<Messages />} />

              <Route path="/farmer/me" element={<Profile />} />

              <Route path="/farmer/notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* ADMIN */}

          <Route element={<RoleRoute allowedRole="admin" />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />

              <Route path="/admin/users" element={<Users />} />

              <Route path="/admin/reports" element={<Reports />} />

              <Route
                path="/admin/inquiries/:inquiryId/proof"
                element={<TransactionProof />}
              />

              <Route
                path="/admin/inquiries/:inquiryId/review"
                element={<TransactionReview />}
              />

              <Route path="/admin/messages" element={<Messages />} />

              <Route path="/admin/me" element={<Profile />} />

              <Route path="/admin/notifications" element={<Notifications />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
