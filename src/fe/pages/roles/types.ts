import React from "react";

// ─── Domain models ────────────────────────────────────────────────────────────

export interface Role {
  _id: string;
  name: string;
  read?: string[];
  write?: string[];
  delete?: string[];
  isSystemAdmin?: boolean;
  showTotalUsers?: boolean;
  showTotalVendorsBilling?: boolean;
  showCabBookingAnalytics?: boolean;
  showScheduleThisWeek?: boolean;
  isAVP?: boolean;
  permissions?: string[]; // legacy format from API
}

// ─── Form / Mutation types ─────────────────────────────────────────────────────

export interface RoleFormData {
  name: string;
  modulePerms: Record<string, Record<string, boolean>>;
  editId?: string;
  isSystemAdmin?: boolean;
  showTotalUsers?: boolean;
  showTotalVendorsBilling?: boolean;
  showCabBookingAnalytics?: boolean;
  showScheduleThisWeek?: boolean;
  isAVP?: boolean;
}

// ─── API types ────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ─── UI types ─────────────────────────────────────────────────────────────────


export interface RoleDialogProps {
  open: boolean;
  role?: Role | null;
  onSubmit: (data: RoleFormData) => void;
  onClose: () => void;
}

export interface RolePermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  role: Role | null;
}

export interface RolesPageActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
}

export interface RolesListProps {
  loading: boolean;
  roles: Role[];
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEditRole: (role: Role) => void;
  onViewPermissions: (role: Role) => void;
}

export interface RoleCardProps {
  role: any;
  idx: number;
  openEdit: (role: any) => void;
  onViewPermissions: (role: any) => void;
  small?: boolean;
}

export interface UseRoleDialogOptions {
  open: boolean;
  role?: Role | null;
  onSubmit: (data: RoleFormData) => void;
}

export interface UseRolesListOptions {
  page: number;
  rowsPerPage: number;
  search: string;
}
export interface RolesSkeletonProps {
  count?: number;
}