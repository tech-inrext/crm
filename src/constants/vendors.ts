// API Constants
export const VENDORS_API_BASE = "/api/v0/vendor";
export const ROLES_API_BASE = "/api/v0/role";
export const DEPARTMENTS_API_BASE = "/api/v0/department";

// Pagination Constants
export const VENDORS_ROWS_PER_PAGE_OPTIONS = [5, 10, 15, 25];
export const DEFAULT_PAGE_SIZE = 10;

// Form Default Values
export const DEFAULT_VENDOR_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  gender: "Male",
  age: "",
  altPhone: "",
  joiningDate: "",
  designation: "",
  managerId: "",
  departmentId: "",
  roles: [],
};

// Gender Options
export const GENDER_OPTIONS = ["Male", "Female", "Other"];

// Table Header Configuration
export const VENDORS_TABLE_HEADER = [
  { label: "Name", dataKey: "name" },
  { label: "Email", dataKey: "email" },
  { label: "Phone", dataKey: "phone" },
  { label: "Designation", dataKey: "designation" },
  {
    label: "Actions",
    component: "action-buttons", // Will be handled in component
  },
];

// Search Configuration
export const SEARCH_PLACEHOLDER = "Search vendors by name, email, phone...";
export const SEARCH_DEBOUNCE_DELAY = 600;

// UI Constants
export const FAB_POSITION = {
  bottom: 24,
  right: 24,
  zIndex: 1201,
};

// Permission Module
export const VENDORS_PERMISSION_MODULE = "vendor";

// Validation Schema Constants
// Field Labels
export const FIELD_LABELS = {
  BASIC_INFO: "Basic Information",
  FULL_NAME: "Full Name",
  EMAIL: "Email",
  PHONE: "Phone",
  ADDRESS: "Address",
  GENDER: "Gender",
  ORGANIZATION: "Organization",
  MANAGER: "Manager",
  DEPARTMENT: "Department",
  ROLES: "Roles",
};
// Button Labels
export const BUTTON_LABELS = {
  ADD_VENDOR: "Add Vendor",
  EDIT_VENDOR: "Edit Vendor",
  SAVE: "Save",
  ADD: "Add",
  CANCEL: "Cancel",
};
export const VALIDATION_RULES = {
  NAME: { min: 2, max: 50 },
  ADDRESS: { min: 5 },
  AGE: { min: 0, max: 120 },
  DESIGNATION: { min: 2, max: 50 },
};
