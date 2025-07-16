"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Box, Typography, Alert } from "@mui/material";
import { Lock } from "@mui/icons-material";

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

  let hasAccess = false;
  switch (action) {
    case "read":
      hasAccess = permissions.hasReadAccess;
      break;
    case "write":
      hasAccess = permissions.hasWriteAccess;
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
