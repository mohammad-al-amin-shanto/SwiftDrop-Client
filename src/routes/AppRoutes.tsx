import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { selectIsAuthenticated } from "../features/auth/authSelectors";
import PageLoader from "../components/ui/PageLoader";

// Layout & guards (these are small / central, can stay eagerly loaded)
import AppShell from "../components/layout/AppShell";
import RequireAuth from "./RequireAuth";
import NotFound from "../pages/public/NotFound";

type CurrentUserLite = {
  role?: string;
} | null;

// ---------- Lazy-loaded pages ----------

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
  const currentUser = useAppSelector(
    (s) => (s.auth?.user as CurrentUserLite) ?? null
  );

  const chooseDashboard = () => {
    const role = currentUser?.role ?? "";
    if (role === "admin") return "/dashboard/admin";
    if (role === "receiver") return "/dashboard/receiver";
    return "/dashboard/sender";
  };

  // When hit "/", unauth → Home, auth → redirect to own dashboard
  const HomeOrRedirect: React.FC = () => {
    if (!isAuth) return <Home />;
    return <Navigate to={chooseDashboard()} replace />;
  };

  return (
    <Suspense fallback={<PageLoader />}>
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
