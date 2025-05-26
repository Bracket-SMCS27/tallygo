import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("tallygo_logged_in") === "true";
  return isLoggedIn ? children : <Navigate to="/tallygo/" replace />;
};

export default ProtectedRoute;
