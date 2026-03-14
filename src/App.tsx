/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Splash from './pages/splash';
import Login from './pages/login';
import Home from './pages/home';
import Products from './pages/products';
import ProductDetail from './pages/productDetail';
import Cart from './pages/cart';
import Checkout from './pages/checkout';
import OrderConfirmed from './pages/orderConfirmed';
import Orders from './pages/orders';
import Profile from './pages/profile';
import ThemeSettings from './pages/theme';
import Support from './pages/support';
import Games from './pages/games';
import Wishlist from './pages/wishlist';
import AdminPanel from './pages/admin';
import NoInternet from './components/NoInternet';

import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/home" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Toaster position="top-center" />
            <NoInternet />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/login" element={<Login />} />
              
              {/* Public Routes */}
              <Route path="/home" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              
              {/* Protected Routes */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/order-confirmed" element={<ProtectedRoute><OrderConfirmed /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/theme" element={<ProtectedRoute><ThemeSettings /></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
              <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
              
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

