import { Routes, Route } from "react-router-dom";
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Faq from "../pages/public/Faq";
import Features from "../pages/public/Features";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import SenderDashboard from "../pages/dashboards/SenderDashboard";
import ReceiverDashboard from "../pages/dashboards/ReceiverDashboard";
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import { RequireAuth } from "./RequireAuth";
import { RequireRole } from "./RequireRole";
import TrackingPage from "../pages/tracking/TrackingPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/tracking" element={<TrackingPage />} />

      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

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
      {/* 403 */}
      <Route
        path="/403"
        element={<div className="p-8">Not authorized — contact admin</div>}
      />
    </Routes>
  );
}
