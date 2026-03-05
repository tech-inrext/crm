// ─── API Constants ────────────────────────────────────────────────────────────
export const DEPARTMENTS_API_BASE = "/api/v0/department";

/**
 * Cache invalidation keys — match the URL prefixes used by useMutation's cache.
 */
export const DEPARTMENT_CACHE_KEYS = {
  /** Invalidates entire department list */
  DEPARTMENTS: DEPARTMENTS_API_BASE,
  /** Invalidates a single department entry */
  DEPARTMENT_BY_ID: (id: string) => `${DEPARTMENTS_API_BASE}/${id}`,
} as const;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEPARTMENTS_ROWS_PER_PAGE_OPTIONS = [5, 10, 15, 25] as const;
export const DEFAULT_PAGE_SIZE = 10;

// ─── Form defaults ────────────────────────────────────────────────────────────
export const DEFAULT_DEPARTMENT_FORM = {
  name: "",
  description: "",
  managerId: "",
  attachments: [] as { filename: string; url: string }[],
};

// ─── Search ───────────────────────────────────────────────────────────────────
export const SEARCH_PLACEHOLDER = "Search departments by name or ID…";
export const SEARCH_DEBOUNCE_DELAY = 600;

// ─── UI ───────────────────────────────────────────────────────────────────────
export const FAB_POSITION = { bottom: 24, right: 24, zIndex: 1201 } as const;

// ─── Permissions ──────────────────────────────────────────────────────────────
export const DEPARTMENTS_PERMISSION_MODULE = "department";

// ─── Validation ───────────────────────────────────────────────────────────────
export const VALIDATION_RULES = {
  NAME: { min: 2, max: 100 },
  DESCRIPTION: { max: 250 },
} as const;

// ─── Labels ───────────────────────────────────────────────────────────────────
export const FIELD_LABELS = {
  NAME: "Department Name *",
  DESCRIPTION: "Description",
  MANAGER: "Manager",
  ATTACHMENTS: "Attachments",
} as const;

export const BUTTON_LABELS = {
  CANCEL: "Cancel",
  SAVE: "Save",
  ADD: "Add",
  EDIT_DEPARTMENT: "Edit Department",
  ADD_DEPARTMENT: "Add Department",
} as const;

// ─── Shared style tokens ──────────────────────────────────────────────────────
export const GRADIENTS = {
  button: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  header: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
} as const;
