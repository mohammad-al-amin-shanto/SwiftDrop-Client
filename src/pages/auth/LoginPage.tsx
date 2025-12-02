// src/pages/auth/LoginPage.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectIsAuthenticated } from "../../features/auth/authSelectors";
import LoginForm from "../../components/auth/LoginForm";

/**
 * Minimal local type for the user object we care about here.
 * Replace with your actual User type when available.
 */
type CurrentUserLite = {
  role?: string;
} | null;

type FromState = {
  from?: {
    pathname?: string;
  };
} | null;

const LoginPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuth = useAppSelector(selectIsAuthenticated);

  // Safely type location.state to avoid `any`.
  const state = (location.state as FromState) ?? null;
  const from = state?.from?.pathname;

  // Read current user directly from Redux store slice.
  const currentUser = useAppSelector(
    (s) => (s.auth?.user as CurrentUserLite) ?? null
  );

  // Redirect if already logged in (session persisted)
  React.useEffect(() => {
    if (isAuth) {
      // prefer redirecting to `from` if present (user attempted to access a protected page)
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      const role = currentUser?.role ?? "";
      if (role === "admin") navigate("/dashboard/admin", { replace: true });
      else if (role === "receiver")
        navigate("/dashboard/receiver", { replace: true });
      else navigate("/dashboard/sender", { replace: true });
    }
  }, [isAuth, currentUser, navigate, from]);

  // Immediate redirect callback for LoginForm to call after successful login.
  // This lets LoginForm short-circuit its internal navigation and delegate to this page,
  // which prefers the `from` route when present.
  const handleSuccess = () => {
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    const role = currentUser?.role ?? "";
    if (role === "admin") navigate("/dashboard/admin", { replace: true });
    else if (role === "receiver")
      navigate("/dashboard/receiver", { replace: true });
    else navigate("/dashboard/sender", { replace: true });
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      {/* pass handleSuccess to LoginForm (it's optional) so redirect is immediate */}
      <LoginForm onSuccess={handleSuccess} />
    </div>
  );
};

export default LoginPage;
