import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../pages/ProtectedRoute";

const Home = lazy(() => import("../pages/user/Home"));
const Register = lazy(() => import("../pages/user/RegisterForm"));
const Login = lazy(() => import("../pages/user/LoginForm"));
const Terms = lazy(() => import("../pages/user/Terms"));
const Apple = lazy(() => import("../pages/user/Apple"));
const Laptop = lazy(() => import("../pages/user/Laptop"));
const Test = lazy(() => import("../pages/user/Test"));
const Profile = lazy(() => import("../pages/user/Profile"));
const ProductPage = lazy(() => import("../pages/user/Product"));
const StorePage = lazy(() => import("../pages/user/Store"));
const CartPage = lazy(() => import("../pages/user/Cart"));
const CheckoutPage = lazy(() => import("../components/OrderPage/Checkout"));
const OrderConfirmation = lazy(() => import("../components/OrderPage/OrderConfirmation"));
const AccessoriesPage = lazy(() => import("../pages/user/Accessories"));
const EchooSupport = lazy(() => import("../pages/user/Support"));

const AdminLayout = lazy(() => import("../pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard/AdminDashboard"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUsers"));
const AdminProducts = lazy(() => import("../pages/admin/AdminProducts/AdminProducts"));
const AdminOrders = lazy(() => import("../pages/admin/AdminOrders/AdminOrder"));
const UserLayout = lazy(() => import("../pages/user/UserLayout"));

const RouteLoader = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="flex items-center gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <span className="text-gray-700">Loading page...</span>
    </div>
  </div>
);

const AppRouter = () => {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/sign_up" element={<Register />} />
        <Route path="/sign_in" element={<Login />} />
        <Route path="/terms_conditions" element={<Terms />} />

        <Route
          path="/"
          element={
            <ProtectedRoute requiredRole="User">
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="store" element={<StorePage />} />
          <Route path="apple" element={<Apple />} />
          <Route path="lap" element={<Laptop />} />
          <Route path="laptop" element={<Laptop />} />
          <Route path="test" element={<Test />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/overview" element={<Profile />} />
          <Route path="profile/orders" element={<Profile />} />
          <Route path="profile/wishlist" element={<Profile />} />
          <Route path="profile/cart" element={<Profile />} />
          <Route path="product/:slug" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="accessories" element={<AccessoriesPage />} />
          <Route path="support" element={<EchooSupport />} />
        </Route>

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
