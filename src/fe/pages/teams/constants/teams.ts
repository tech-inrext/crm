// ─── API Endpoints ────────────────────────────────────────────────────────────
export const API_ENDPOINTS = {
  EMPLOYEE_LIST: "/api/v0/employee/getAllEmployeeList",
  HIERARCHY: "/api/v0/employee/hierarchy",
} as const;

// ─── Search ───────────────────────────────────────────────────────────────────
export const SEARCH_DEBOUNCE_DELAY = 300;

// ─── Permissions ──────────────────────────────────────────────────────────────
export const TEAMS_PERMISSION_MODULE = "team";

// ─── Colours used for hierarchy depth levels ─────────────────────────────────
export const HIERARCHY_COLORS = [
  "#3f51b5",
  "#00bcd4",
  "#4caf50",
  "#ff9800",
  "#e91e63",
] as const;
