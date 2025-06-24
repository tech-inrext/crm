"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Box, Typography, Alert } from "@mui/material";
import { Lock } from "@mui/icons-material";

interface PermissionGuardProps {
  children: React.ReactNode;
  module: string;
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  module,
  fallback,
}) => {
  const { getPermissions } = useAuth();
  const { hasReadAccess } = getPermissions(module);

  return (
    <>
      {hasReadAccess && children}
      {!hasReadAccess && (
        <>
          {fallback || (
            <Alert severity="warning" icon={<Lock />} sx={{ m: 2 }}>
              <Typography variant="body2">
                You don&apos;t have permission to {action} {module} data.
              </Typography>
            </Alert>
          )}
        </>
      )}
    </>
  );
};

export default PermissionGuard;
