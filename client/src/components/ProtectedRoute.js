import React from "react";
import { Navigate } from "react-router-dom";

// This component acts as a security gateway. It checks if a user session 
// exists in localStorage; if not, it redirects the browser to the login page.
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? children : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;