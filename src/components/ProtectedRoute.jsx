// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, children }) {
  if (!user) {
    // user not logged in → send to SignIn
    return <Navigate to="/signin" replace />;
  }
  return children;
}