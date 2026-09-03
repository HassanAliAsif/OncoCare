import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

/**
 * RoleRoute gates routes by the current user's role.
 * - allowedRoles: array of roles permitted to pass through
 * - redirectTo: path to send disallowed users to
 */
export default function RoleRoute({ allowedRoles, redirectTo }) {
  const { user, authChecked, isLoadingAuth } = useAuth();
  const [checking, setChecking] = useState(!user);

  useEffect(() => {
    if (authChecked && !isLoadingAuth) setChecking(false);
  }, [authChecked, isLoadingAuth]);

  if (checking || !authChecked || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to={redirectTo} replace />;