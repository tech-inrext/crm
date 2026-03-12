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

export interface TostProps {
  open: boolean;
  message: string;
  severity: "success" | "error";
  onClose: () => void;
}
