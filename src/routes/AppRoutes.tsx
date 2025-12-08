// src/routes/AppRoutes.tsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { selectIsAuthenticated } from "../features/auth/authSelectors";

// Public pages
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Features from "../pages/public/Features";
import Contact from "../pages/public/Contact";
import Faq from "../pages/public/Faq";

// Auth pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

// Dashboards
import SenderDashboard from "../pages/dashboards/SenderDashboard";
import ReceiverDashboard from "../pages/dashboards/ReceiverDashboard";
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import TrackingPage from "../pages/tracking/TrackingPage";

// Profile
import ProfilePage from "../pages/profile/ProfilePage";

// Layout & guards
import AppShell from "../components/layout/AppShell";
import RequireAuth from "./RequireAuth";

/**
 * Minimal local type for the user object shape we rely on here.
 * Replace with your real User type if you have one exported from types/.
 */
type CurrentUserLite = {
  role?: string;
} | null;

const AppRoutes: React.FC = () => {
  const isAuth = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(
    (s) => (s.auth?.user as CurrentUserLite) ?? null
  );
  const location = useLocation();

  const chooseDashboard = () => {
    const role = currentUser?.role ?? "";
    if (role === "admin") return "/dashboard/admin";
    if (role === "receiver") return "/dashboard/receiver";
    return "/dashboard/sender";
  };

  // When you hit "/", unauth → Home, auth → redirect to own dashboard
  const HomeOrRedirect: React.FC = () => {
    if (!isAuth) return <Home />;
    return <Navigate to={chooseDashboard()} replace />;
  };

  return (
    <Routes>
      {/* Root landing route */}
      <Route path="/" element={<HomeOrRedirect />} />

      {/* Public pages - accessible even when logged in */}
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<Faq />} />

      {/* Auth routes */}
      <Route
        path="/auth/login"
        element={
          isAuth ? <Navigate to={chooseDashboard()} replace /> : <LoginPage />
        }
      />
      <Route
        path="/auth/register"
        element={
          isAuth ? (
            <Navigate to={chooseDashboard()} replace />
          ) : (
            <RegisterPage />
          )
        }
      />

      {/* Protected profile route (top-level /profile) */}
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />

      {/* Protected dashboard section using AppShell */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="sender" element={<SenderDashboard />} />
        <Route path="receiver" element={<ReceiverDashboard />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="tracking" element={<TrackingPage />} />
        {/* default dashboard route */}
        <Route index element={<Navigate to="/dashboard/sender" replace />} />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to="/" replace state={{ from: location }} />}
      />
    </Routes>
  );
};

export default AppRoutes;
