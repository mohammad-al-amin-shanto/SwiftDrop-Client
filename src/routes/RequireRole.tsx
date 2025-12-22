import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

type Props = {
  role: string | string[];
  children: React.ReactNode;
};

export const RequireRole: React.FC<Props> = ({ role, children }) => {
  const user = useAppSelector((s) => s.auth.user);

  if (!user) return <Navigate to="/auth/login" replace />;

  const allowedRoles = Array.isArray(role) ? role : [role];

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
