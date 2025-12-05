"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionGuardProps {
  children: React.ReactNode;
  module: string;
  action?: "read" | "write" | "delete";
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  module,
  action = "read",
  fallback,
}) => {
  const { getPermissions } = useAuth();
  const permissions = getPermissions(module);
  const { user } = useAuth();

  // Determine if the currently selected role is marked system-admin.
  let isSystemAdmin = false;
  if (user) {
    let currentRole = user.currentRole;
    if (typeof currentRole === "string" && user.roles) {
      currentRole = user.roles.find((r) => r._id === currentRole);
    }
    if (currentRole && typeof currentRole !== "string") {
      const v = (currentRole as any).isSystemAdmin;
      isSystemAdmin =
        typeof v === "string" ? v.toLowerCase() === "true" : Boolean(v);
    }
  }

  let hasAccess = false;
  switch (action) {
    case "read":
      hasAccess = permissions.hasReadAccess;
      break;
    case "write":
      // Allow system-admins to perform write actions for cab-booking (assign vendor)
      if (isSystemAdmin && module === "cab-booking") {
        hasAccess = true;
      } else {
        hasAccess = permissions.hasWriteAccess;
      }
      break;
    case "delete":
      hasAccess = permissions.hasDeleteAccess;
      break;
    default:
      hasAccess = permissions.hasReadAccess;
  }

  return (
    <>
      {hasAccess && children}
      {!hasAccess && fallback}
    </>
  );
};

export default PermissionGuard;


