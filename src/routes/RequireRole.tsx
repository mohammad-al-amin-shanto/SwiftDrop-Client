// src/routes/RequireRole.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

type Props = {
  role: string | string[]; // allowed roles
  children: React.ReactNode;
};

export const RequireRole: React.FC<Props> = ({ role, children }) => {
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/auth/login" replace />;

  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(user.role)) {
    // optionally show a "Not authorized" page
    return <Navigate to="/403" replace />;
  }
  return <>{children}</>;
};
