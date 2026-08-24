import { Routes, Route } from "react-router-dom";

import HomeRedirect from "./HomeRedirect";
import PublicRoute from "./PublicRoute";
import RoleRoute from "./RoleRoute";

import PublicLayout from "../layouts/PublicLayout";
import AppLayout from "../layouts/AppLayout";

import SuspendedRoute from "./SuspendedRoute";
import Suspended from "../pages/Suspended.jsx";

import Landing from "../pages/public/Landing";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import ForgotPassword from "../pages/public/ForgotPassword";

import ConsumerHome from "../pages/consumer/Home";
import Nearby from "../pages/consumer/Nearby";

import FarmerDashboard from "../pages/farmer/Dashboard";
import MyProducts from "../pages/farmer/MyProducts";
import Reviews from "../pages/farmer/Reviews";

import AdminDashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import Reports from "../pages/admin/Reports.jsx";

import ProductDetails from "../pages/shared/ProductDetails";
import StoreProfile from "../pages/shared/StoreProfile";
import Inquiries from "../pages/shared/Inquiries";
import TransactionProof from "../pages/shared/TransactionProof";
import TransactionReview from "../pages/shared/TransactionReview";
import Messages from "../pages/shared/Messages";
import Profile from "../pages/shared/Profile";
import Notifications from "../pages/shared/Notifications";

import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ROOT */}

      <Route path="/" element={<HomeRedirect />} />

      <Route element={<SuspendedRoute />}>
        <Route path="/suspended" element={<Suspended />} />
      </Route>

      {/* PUBLIC */}

      <Route element={<PublicRoute />}>
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/landing" element={<Landing />} />
        </Route>
      </Route>

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

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
