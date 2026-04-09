export const USERS_API_BASE = "/api/v0/employee";
export const ROLES_API_BASE = "/api/v0/role";
export const DEPARTMENTS_API_BASE = "/api/v0/department";

export const VENDORS_ROWS_PER_PAGE_OPTIONS = [5, 10, 15, 25] as const;
export const DEFAULT_PAGE_SIZE = 10;

export const DEFAULT_VENDOR_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  panNumber: "",
};

export const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

export const VENDORS_TABLE_HEADER = [
  { label: "Name", dataKey: "name" },
  { label: "Email", dataKey: "email" },
  { label: "Phone", dataKey: "phone" },
  { label: "Designation", dataKey: "designation" },
  { label: "Actions", component: "action-buttons" },
] as const;

export const SEARCH_PLACEHOLDER = "Search vendors by name, email, phone…";
export const SEARCH_DEBOUNCE_DELAY = 600;

export const FAB_POSITION = { bottom: 24, right: 24, zIndex: 1201 } as const;

export const VENDORS_PERMISSION_MODULE = "vendor";

export const VALIDATION_RULES = {
  NAME: { min: 3, max: 50 },
  ADDRESS: { min: 2 },
  AGE: { min: 0, max: 120 },
  DESIGNATION: { min: 2, max: 50 },
} as const;

export const FIELD_LABELS = {
  BASIC_INFO: "Basic Information",
  FULL_NAME: "Full Name",
  EMAIL: "Email",
  PHONE: "Phone",
  PAN_NUMBER: "PAN Number",
  ADDRESS: "Address",
} as const;

export const BUTTON_LABELS = {
  ADD_VENDOR: "Add Vendor",
  EDIT_VENDOR: "Edit Vendor",
  SAVE: "Save",
  ADD: "Add",
  CANCEL: "Cancel",
} as const;

export const GRADIENTS = {
  button: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  header: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
} as const;
