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

  const HomeOrRedirect: React.FC = () => {
    if (!isAuth) return <Home />;
    return <Navigate to={chooseDashboard()} replace />;
  };

  const PublicOnly: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    if (isAuth) return <Navigate to={chooseDashboard()} replace />;
    return <>{children}</>;
  };

  return (
    <Routes>
      {/* root */}
      <Route path="/" element={<HomeOrRedirect />} />

      {/* public pages */}
      <Route
        path="/about"
        element={
          <PublicOnly>
            <About />
          </PublicOnly>
        }
      />
      <Route
        path="/features"
        element={
          <PublicOnly>
            <Features />
          </PublicOnly>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicOnly>
            <Contact />
          </PublicOnly>
        }
      />
      <Route
        path="/faq"
        element={
          <PublicOnly>
            <Faq />
          </PublicOnly>
        }
      />

      {/* auth */}
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

      {/* protected (AppShell) - keeps your dashboard nesting */}
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

        {/* dashboard-scoped features route so logged-in users can access features inside AppShell */}
        <Route path="features" element={<Features />} />

        {/* default */}
        <Route index element={<Navigate to="/dashboard/sender" replace />} />
      </Route>

      {/* fallback */}
      <Route
        path="*"
        element={<Navigate to="/" replace state={{ from: location }} />}
      />
    </Routes>
  );
};

export default AppRoutes;
