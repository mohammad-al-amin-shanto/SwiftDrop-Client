import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { selectIsAuthenticated } from "../features/auth/authSelectors";
import PageLoader from "../components/ui/PageLoader";

import AppShell from "../components/layout/AppShell";
import RequireAuth from "./RequireAuth";
import { RequireRole } from "./RequireRole";
import NotFound from "../pages/public/NotFound";

// Public pages
const Home = lazy(() => import("../pages/public/Home"));
const About = lazy(() => import("../pages/public/About"));
const Features = lazy(() => import("../pages/public/Features"));
const Contact = lazy(() => import("../pages/public/Contact"));
const Faq = lazy(() => import("../pages/public/Faq"));

// Auth pages
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));

// Dashboards
const SenderDashboard = lazy(
  () => import("../pages/dashboards/SenderDashboard")
);
const ReceiverDashboard = lazy(
  () => import("../pages/dashboards/ReceiverDashboard")
);
const AdminDashboard = lazy(() => import("../pages/dashboards/AdminDashboard"));
const TrackingPage = lazy(() => import("../pages/tracking/TrackingPage"));

// Profile
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));

const AppRoutes: React.FC = () => {
  const isAuth = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector((s) => s.auth.user);

  const getDashboardPath = () => {
    if (!user?.role) return "/dashboard/sender";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "receiver") return "/dashboard/receiver";
    return "/dashboard/sender";
  };

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root */}
        <Route
          path="/"
          element={isAuth ? <Navigate to="/dashboard" replace /> : <Home />}
        />

        {/* Public */}
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />

        {/* Auth */}
        <Route
          path="/auth/login"
          element={
            isAuth ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />
        <Route
          path="/auth/register"
          element={
            isAuth ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          {/* ROLE-AWARE DEFAULT */}
          <Route index element={<Navigate to={getDashboardPath()} replace />} />

          <Route
            path="sender"
            element={
              <RequireRole role="sender">
                <SenderDashboard />
              </RequireRole>
            }
          />

          <Route
            path="receiver"
            element={
              <RequireRole role="receiver">
                <ReceiverDashboard />
              </RequireRole>
            }
          />

          <Route
            path="admin"
            element={
              <RequireRole role="admin">
                <AdminDashboard />
              </RequireRole>
            }
          />

          <Route path="tracking" element={<TrackingPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
