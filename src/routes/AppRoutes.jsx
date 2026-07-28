import { Routes, Route } from "react-router-dom";

import HomeRedirect from "./HomeRedirect";

import PublicRoute from "./PublicRoute";
import ConsumerRoute from "./ConsumerRoute";
import FarmerRoute from "./FarmerRoute";

import PublicLayout from "../layouts/PublicLayout";
import ConsumerLayout from "../layouts/ConsumerLayout";
import FarmerLayout from "../layouts/FarmerLayout";

import Landing from "../pages/public/Landing";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import ForgotPassword from "../pages/public/ForgotPassword";

import ConsumerHome from "../pages/consumer/Home";
import Nearby from "../pages/consumer/Nearby";
import ViewProduct from "../pages/consumer/ViewProduct";
import ViewProfile from "../pages/shared/ViewProfile";

import FarmerDashboard from "../pages/farmer/Dashboard";
import MyProducts from "../pages/farmer/MyProducts";
import Inquiries from "../pages/farmer/Inquiries";
import Reviews from "../pages/farmer/Reviews";

import Messages from "../pages/shared/Messages";
import Profile from "../pages/shared/Profile";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

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

      <Route element={<ConsumerRoute />}>
        <Route element={<ConsumerLayout />}>
          <Route path="/home" element={<ConsumerHome />} />

          <Route path="/nearby" element={<Nearby />} />

          <Route path="/product/:id" element={<ViewProduct />} />

          <Route path="/user/:id" element={<ViewProfile />} />

          <Route path="/messages" element={<Messages />} />

          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* FARMER */}

      <Route element={<FarmerRoute />}>
        <Route element={<FarmerLayout />}>
          <Route path="/farmer" element={<FarmerDashboard />} />

          <Route path="/farmer/products" element={<MyProducts />} />

          <Route path="/farmer/inquiries" element={<Inquiries />} />

          <Route path="/farmer/reviews" element={<Reviews />} />

          <Route path="/farmer/messages" element={<Messages />} />

          <Route path="/farmer/profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
}
