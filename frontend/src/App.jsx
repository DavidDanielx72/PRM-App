// Community Store - main app with routing
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Welcome from './pages/Welcome';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import StudentHome from './pages/student/StudentHome';
import ProductDetail from './pages/student/ProductDetail';
import Cart from './pages/student/Cart';
import Orders from './pages/student/Orders';
import Announcements from './pages/student/Announcements';
import Messages from './pages/shared/Messages';
import Community from './pages/shared/Community';
import Profile from './pages/shared/Profile';
import SellerDashboard from './pages/seller/SellerDashboard';
import AddListing from './pages/seller/AddListing';
import SellerOrders from './pages/seller/SellerOrders';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminUsers from './pages/admin/AdminUsers';

// Full-page loader while auth resolves
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-cput-light">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-cput-blue/20 border-t-cput-blue rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Loading…</p>
    </div>
  </div>
);

// Compute the default landing page for a user
function landingFor(profile) {
  if (!profile) return '/student';
  if (profile.role === 'admin') return '/admin';
  if (profile.role === 'seller' || profile.is_seller) return '/seller';
  return '/student';
}

// Protected route wrapper
const Protected = ({ children, roles }) => {
  const { user, profile, loading } = useAuth();

  // Still resolving auth → show spinner
  if (loading) return <LoadingScreen />;

  // Not signed in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // Signed in but profile hasn't loaded yet → show spinner
  // (prevents the redirect loop we just fixed)
  if (!profile) return <LoadingScreen />;

  // Role mismatch → send to their correct home
  if (roles && !roles.includes(profile.role)) {
    return <Navigate to={landingFor(profile)} replace />;
  }

  return children;
};

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  // If logged in but profile not loaded yet, don't redirect — show spinner
  const homeForUser = user && profile ? landingFor(profile) : null;

  return (
    <Routes>
      {/* Public / landing */}
      <Route
        path="/"
        element={
          !user ? (
            <Welcome />
          ) : !profile ? (
            <LoadingScreen />
          ) : (
            <Navigate to={homeForUser} replace />
          )
        }
      />
      <Route
        path="/login"
        element={!user ? <Login /> : !profile ? <LoadingScreen /> : <Navigate to={homeForUser} replace />}
      />
      <Route
        path="/signup"
        element={!user ? <SignUp /> : !profile ? <LoadingScreen /> : <Navigate to={homeForUser} replace />}
      />

      {/* Marketplace — students, sellers & admins can browse */}
      <Route path="/student" element={<Protected><StudentHome /></Protected>} />
      <Route path="/product/:id" element={<Protected><ProductDetail /></Protected>} />
      <Route path="/cart" element={<Protected><Cart /></Protected>} />
      <Route path="/orders" element={<Protected><Orders /></Protected>} />
      <Route path="/announcements" element={<Protected><Announcements /></Protected>} />
      <Route path="/community" element={<Protected><Community /></Protected>} />

      {/* Shared */}
      <Route path="/messages" element={<Protected><Messages /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />

      {/* Seller */}
      <Route path="/seller" element={<Protected roles={['seller', 'admin']}><SellerDashboard /></Protected>} />
      <Route path="/seller/add-listing" element={<Protected roles={['seller', 'admin']}><AddListing /></Protected>} />
      <Route path="/seller/listings/:listingId/edit" element={<Protected roles={['seller', 'admin']}><AddListing /></Protected>} />
      <Route path="/seller/orders" element={<Protected roles={['seller', 'admin']}><SellerOrders /></Protected>} />

      {/* Admin */}
      <Route path="/admin" element={<Protected roles={['admin']}><AdminDashboard /></Protected>} />
      <Route path="/admin/announcements" element={<Protected roles={['admin']}><AdminAnnouncements /></Protected>} />
      <Route path="/admin/users" element={<Protected roles={['admin']}><AdminUsers /></Protected>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ style: { fontSize: '14px' } }} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
