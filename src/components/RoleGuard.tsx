import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import type { ReactNode } from "react";
import type { Role } from "../types";

interface Props {
  allowedRoles: Role[];
  children: ReactNode;
}

const RoleGuard = ({ allowedRoles, children }: Props) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default RoleGuard;
