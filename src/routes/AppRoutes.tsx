// src/routes/AppRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import * as HomeModule from "../pages/public/Home";
import * as AboutModule from "..//pages/public/About";
import * as ContactModule from "../pages/public/Contact";
import * as FaqModule from "../pages/public/Faq";
import * as FeaturesModule from "../pages/public/Features";

import TrackingPage from "../pages/tracking/TrackingPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import SenderDashboard from "../pages/dashboards/SenderDashboard";
import ReceiverDashboard from "../pages/dashboards/ReceiverDashboard";
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import { RequireAuth } from "./RequireAuth";
import { RequireRole } from "./RequireRole";
import { useAppSelector } from "../app/hooks";

/**
 * Type guard: is this value a React component (function/class/forwardRef/etc)?
 * We keep this conservative: function OR non-null object.
 */
function isReactComponent(
  value: unknown
): value is React.ComponentType<unknown> {
  return (
    typeof value === "function" || (typeof value === "object" && value !== null)
  );
}

/**
 * Resolve a React component from a module namespace.
 */
function resolveModuleComponent<TProps = unknown>(
  mod: unknown,
  displayName = "Page"
): React.ComponentType<TProps> {
  // treat module as an indexable record of unknowns
  const m = (mod as Record<string, unknown> | null) ?? {};

  // pick the most likely export candidates (default first, then common names)
  const candidate =
    m["default"] ??
    m["Home"] ??
    m["home"] ??
    m["About"] ??
    m["about"] ??
    m["Contact"] ??
    m["contact"] ??
    m["Faq"] ??
    m["faq"] ??
    m["Features"] ??
    m["features"] ??
    null;

  if (isReactComponent(candidate)) {
    // safe cast — we've validated it's a component at runtime
    return candidate as React.ComponentType<TProps>;
  }

  // fallback component: friendly error UI
  const Fallback: React.FC<TProps> = () => (
    <div className="p-8 text-center">
      <h2 className="text-xl font-semibold">{displayName} missing</h2>
      <p className="text-sm text-gray-500 mt-2">
        The module for <strong>{displayName}</strong> does not export a usable
        component.
      </p>
    </div>
  );

  return Fallback;
}

// Resolve public pages (works whether the modules export default or named)
const Home = resolveModuleComponent(HomeModule, "Home");
const About = resolveModuleComponent(AboutModule, "About");
const Contact = resolveModuleComponent(ContactModule, "Contact");
const Faq = resolveModuleComponent(FaqModule, "Faq");
const Features = resolveModuleComponent(FeaturesModule, "Features");

const RequireNoAuth: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // IMPORTANT: Hooks must be at top level (no conditions)
  const token = useAppSelector((s) => s.auth.token);
  const role = useAppSelector((s) => s.auth.user?.role);

  if (token) {
    if (role === "sender") return <Navigate to="/dashboard/sender" replace />;
    if (role === "receiver")
      return <Navigate to="/dashboard/receiver" replace />;
    if (role === "admin") return <Navigate to="/dashboard/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/tracking" element={<TrackingPage />} />

      {/* Auth */}
      <Route
        path="/auth/login"
        element={
          <RequireNoAuth>
            <LoginPage />
          </RequireNoAuth>
        }
      />

      <Route
        path="/auth/register"
        element={
          <RequireNoAuth>
            <RegisterPage />
          </RequireNoAuth>
        }
      />

      {/* Dashboards */}
      <Route
        path="/dashboard/sender"
        element={
          <RequireAuth>
            <RequireRole role="sender">
              <SenderDashboard />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/dashboard/receiver"
        element={
          <RequireAuth>
            <RequireRole role="receiver">
              <ReceiverDashboard />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <RequireAuth>
            <RequireRole role="admin">
              <AdminDashboard />
            </RequireRole>
          </RequireAuth>
        }
      />

      {/* Fallback */}
      <Route
        path="/403"
        element={<div className="p-8">Not authorized — contact admin</div>}
      />
    </Routes>
  );
}
