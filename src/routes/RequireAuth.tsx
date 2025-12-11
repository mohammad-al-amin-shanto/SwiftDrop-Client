import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { selectIsAuthenticated } from "../features/auth/authSelectors";

type Props = {
  children: React.ReactNode;
};

const RequireAuth: React.FC<Props> = ({ children }) => {
  const isAuth = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuth) {
    // preserve where the user tried to go so Login can redirect back
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default RequireAuth;
