// ─── API Constants ────────────────────────────────────────────────────────────
export const ROLES_API_BASE = "/api/v0/role";

export const ROLE_CACHE_KEYS = {
  ROLES: ROLES_API_BASE,
  ROLE_BY_ID: (id: string) => `${ROLES_API_BASE}/${id}`,
} as const;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const ROLES_ROWS_PER_PAGE_OPTIONS = [3, 6, 12, 24] as const;
export const DEFAULT_PAGE_SIZE = 6;

// ─── Search ───────────────────────────────────────────────────────────────────
export const SEARCH_PLACEHOLDER = "Search roles by name...";
export const SEARCH_DEBOUNCE_DELAY = 400;

// ─── Permissions ──────────────────────────────────────────────────────────────
export const ROLES_PERMISSION_MODULE = "role";

// ─── UI ───────────────────────────────────────────────────────────────────────
export const FAB_POSITION = { bottom: 24, right: 24, zIndex: 1201 } as const;

export const GRADIENTS = {
  button: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
  buttonHover: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
} as const;

// ─── Module/Permission definitions ────────────────────────────────────────────
export const ROLE_PERMISSIONS = ["read", "write", "delete"] as const;

export const ROLE_MODULES = [
  "User",
  "Role",
  "Lead",
  "Department",
  "CabBooking",
  "CabVendor",
  "Vendor",
  "Team",
  "MOU",
  "Property",
  "BookingLogin",
  "TrainingVideos",
  "Pillar",
  "Analytics",
] as const;
