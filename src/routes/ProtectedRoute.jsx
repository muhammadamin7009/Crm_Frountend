import { Navigate, Outlet } from "react-router-dom";
import { getToken, isTokenExpired, clearSession } from "../utils/auth";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ allowedRoles }) => {
  const token = getToken();

  if (!token || isTokenExpired(token)) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(getUser()?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
