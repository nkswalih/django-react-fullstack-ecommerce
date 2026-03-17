import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './pages/ProtectedRoute';
import './styles/toast.css';
import './index.css';

// User components
import Home from './pages/user/Home'
import Register from './pages/user/RegisterForm'
import Login from './pages/user/LoginForm'
import Terms from './pages/user/Terms'
import Store from './pages/user/Store'
import Apple from './pages/user/Apple'
import Laptop from './pages/user/Laptop'
import Test from './pages/user/Test'
import Profile from './pages/user/Profile'
import ProductPage from './pages/user/Product'
import StorePage from './pages/user/Store'
import CartPage from './pages/user/Cart'
import CheckoutPage from './components/OrderPage/Checkout'
import OrderConfirmation from './components/OrderPage/OrderConfirmation'
import AccessoriesPage from './pages/user/Accessories'
import EchooSupport from './pages/user/Support'

// Admin components
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminProducts from './pages/admin/AdminProducts/AdminProducts'
import UserLayout from './pages/user/UserLayout'
import AdminOrders from './pages/admin/AdminOrders/AdminOrder'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className='bg-white'>

          <Routes>
            {/* Public routes - accessible without login */}
            <Route path="/sign_up" element={<Register />} />
            <Route path="/sign_in" element={<Login />} />
            <Route path="/terms_conditions" element={<Terms />} />

            {/* Protected user routes - requires login with user role */}
            <Route path="/" element={
              <ProtectedRoute requiredRole="User">
                <UserLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/store" element={<Store />} />
              <Route path="/apple" element={<Apple />} />
              <Route path="/lap" element={<Laptop />} />
              <Route path="/test" element={<Test />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/overview" element={<Profile />} />
              <Route path="/profile/orders" element={<Profile />} />
              <Route path="/profile/wishlist" element={<Profile />} />
              <Route path="/profile/cart" element={<Profile />} />
              <Route path="/product/:productId" element={<ProductPage />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/laptop" element={<Laptop />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/accessories" element={<AccessoriesPage />} />
              <Route path="/support" element={<EchooSupport />} />
            </Route>

            {/* Admin routes - requires login with admin role */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="Admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>

            {/* 404 redirect - goes to appropriate page based on role */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{ zIndex: 9999 }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App