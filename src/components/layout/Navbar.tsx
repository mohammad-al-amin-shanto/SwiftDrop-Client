// src/components/layout/Navbar.tsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import Button from "../common/Button";
import { FaBars, FaUserCircle, FaTimes } from "react-icons/fa";
import { setAuth } from "../../features/auth/authSlice";

type Props = {
  onOpenSidebar?: () => void;
};

const Navbar: React.FC<Props> = ({ onOpenSidebar }) => {
  const user = useAppSelector((s) => s.auth.user);
  const isAuth = Boolean(user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // choose path depending on auth state
  const linkTo = (publicPath: string, dashboardPath: string) =>
    isAuth ? dashboardPath : publicPath;

  const activeClass = "text-sky-600 font-semibold";

  const handleLogout = () => {
    // clear persisted storage keys your app uses
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // localStorage.removeItem("persist:root"); // optional if used
    } catch (e) {
      console.warn("Failed to clear storage on logout", e);
    }

    // update redux auth slice to logged-out state
    try {
      dispatch(setAuth({ token: null, user: null }));
    } catch (e) {
      console.warn("Failed to dispatch logout", e);
    }

    navigate("/", { replace: true });
  };

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (onOpenSidebar) onOpenSidebar();
              else setMobileOpen((v) => !v);
            }}
            className="md:hidden p-2 text-lg"
            aria-label="Open menu"
          >
            <FaBars />
          </button>

          <NavLink to="/" className="flex items-center gap-2">
            <img
              src="/Images/SwiftDrop Logo.png"
              alt="SwiftDrop"
              className="w-8 h-8"
            />
            <span className="font-semibold">SwiftDrop</span>
          </NavLink>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink
            to={linkTo("/features", "/dashboard/features")}
            className={({ isActive }) => (isActive ? activeClass : "text-sm")}
          >
            Features
          </NavLink>

          <NavLink
            to={linkTo("/tracking", "/dashboard/tracking")}
            className={({ isActive }) => (isActive ? activeClass : "text-sm")}
          >
            Track
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/profile"
                className="flex items-center gap-2 text-sm"
              >
                <FaUserCircle />
                <span>{user.name}</span>
              </NavLink>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/auth/login">
                <Button variant="ghost" size="md">
                  Login
                </Button>
              </NavLink>
              <NavLink to="/auth/register">
                <Button variant="primary" size="md">
                  Sign up
                </Button>
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile menu button area */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2"
            aria-label="Open mobile menu"
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile menu (dropdown) */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 space-y-2">
            <NavLink
              to={linkTo("/features", "/dashboard/features")}
              onClick={() => setMobileOpen(false)}
              className="block"
            >
              Features
            </NavLink>
            <NavLink
              to={linkTo("/tracking", "/dashboard/tracking")}
              onClick={() => setMobileOpen(false)}
              className="block"
            >
              Track
            </NavLink>

            {user ? (
              <div className="flex items-center justify-between pt-2">
                <NavLink to="/profile" className="flex items-center gap-2">
                  <FaUserCircle />
                  <span>{user.name}</span>
                </NavLink>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-2">
                <NavLink to="/auth/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="md">
                    Login
                  </Button>
                </NavLink>
                <NavLink
                  to="/auth/register"
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="primary" size="md">
                    Sign up
                  </Button>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
