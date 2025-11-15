import React from 'react';

interface PermissionGuardProps {
  children: React.ReactNode;
  module: string;
  action?: "read" | "write" | "delete";
  fallback?: React.ReactNode;
}

// Re-export the PermissionGuard component as a wrapper
export { default } from '../../PermissionGuard';
export type { PermissionGuardProps };