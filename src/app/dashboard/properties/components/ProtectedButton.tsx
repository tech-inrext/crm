// components/ProtectedButton.tsx
"use client";

import React from "react";
import { Button, ButtonProps } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedButtonProps extends Omit<ButtonProps, 'onClick'> {
  module: string;
  action?: "read" | "write" | "delete";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedButton: React.FC<ProtectedButtonProps> = ({
  module,
  action = "read",
  onClick,
  children,
  fallback = null,
  ...buttonProps
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
  }
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return (
    <Button onClick={onClick} {...buttonProps}>
      {children}
    </Button>
  );
};

export default ProtectedButton;