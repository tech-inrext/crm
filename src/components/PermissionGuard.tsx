"use client";

import React from "react";
import { usePermissions } from "../contexts/PermissionsContext";
import { Box, Typography, Alert } from "@mui/material";
import { Lock } from "@mui/icons-material";

interface PermissionGuardProps {
  children: React.ReactNode;
  module: string;
  action: "read" | "write" | "delete";
  fallback?: React.ReactNode;
  hideWhenNoAccess?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  module,
  action,
  fallback,
  hideWhenNoAccess = false,
}) => {
  const { hasReadAccess, hasWriteAccess, hasDeleteAccess, loading } =
    usePermissions();

  // Show loading state while permissions are being fetched
  if (loading) {
    return hideWhenNoAccess ? null : (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Loading permissions...
        </Typography>
      </Box>
    );
  }

  // Check if user has the required permission
  let hasAccess = false;
  switch (action) {
    case "read":
      hasAccess = hasReadAccess(module);
      break;
    case "write":
      hasAccess = hasWriteAccess(module);
      break;
    case "delete":
      hasAccess = hasDeleteAccess(module);
      break;
    default:
      hasAccess = false;
  }

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If hideWhenNoAccess is true, don't render anything
  if (hideWhenNoAccess) {
    return null;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default access denied message
  return (
    <Alert severity="warning" icon={<Lock />} sx={{ m: 2 }}>
      <Typography variant="body2">
        You don&apos;t have permission to {action} {module} data.
      </Typography>
    </Alert>
  );
};

export default PermissionGuard;
