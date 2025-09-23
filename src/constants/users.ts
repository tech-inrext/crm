// API Constants
export const USERS_API_BASE = "/api/v0/employee";
export const ROLES_API_BASE = "/api/v0/role";
export const DEPARTMENTS_API_BASE = "/api/v0/department";

// Pagination Constants
export const USERS_ROWS_PER_PAGE_OPTIONS = [5, 10, 15, 25];
export const DEFAULT_PAGE_SIZE = 10;

// Form Default Values
export const DEFAULT_USER_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  gender: "Male",
  age: "",
  altPhone: "",
  fatherName: "",
  joiningDate: "",
  designation: "",
  managerId: "",
  departmentId: "",
  roles: [],
  // Documents (uploaded files handled separately)
  aadharFile: null,
  panFile: null,
  bankProofFile: null,
  signatureFile: null,
  aadharUrl: "",
  panUrl: "",
  bankProofUrl: "",
  signatureUrl: "",
  // Nominee details (optional)
  nominee: null,
  // Freelancer fields
  slabPercentage: "",
  branch: "",
};

// Gender Options
export const GENDER_OPTIONS = ["Male", "Female", "Other"];

// Table Header Configuration
export const USERS_TABLE_HEADER = [
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
export const SEARCH_PLACEHOLDER = "Search users by name, email, phone...";
export const SEARCH_DEBOUNCE_DELAY = 600;

// UI Constants
export const FAB_POSITION = {
  bottom: 24,
  right: 24,
  zIndex: 1201,
};

// Permission Module
export const USERS_PERMISSION_MODULE = "employee";

// Validation Schema Constants
export const VALIDATION_RULES = {
  NAME: { min: 2, max: 50 },
  ADDRESS: { min: 2 },
  AGE: { min: 0, max: 120 },
  DESIGNATION: { min: 2, max: 50 },
};

// Form Field Labels
export const FIELD_LABELS = {
  BASIC_INFO: "Basic Information",
  ORGANIZATION: "Organization",
  FULL_NAME: "Full Name *",
  AADHAR: "Aadhar Card",
  PAN: "PAN Card",
  BANK_PROOF: "Bank Proof",
  SIGNATURE: "Signature",
  EMAIL: "Email *",
  PHONE: "Phone *",
  ALT_PHONE: "Alternate Phone",
  FATHER_NAME: "Father's Name",
  ADDRESS: "Address *",
  GENDER: "Gender *",
  NOMINEE_DETAILS: "Nominee Details",
  NOMINEE_FULL_NAME: "Full Name",
  NOMINEE_PHONE: "Phone Number",
  NOMINEE_OCCUPATION: "Occupation",
  NOMINEE_RELATION: "Relation with Nominee",
  NOMINEE_GENDER: "Gender",
  AGE: "Age",
  JOINING_DATE: "Joining Date",
  DESIGNATION: "Designation *",
  MANAGER: "Manager",
  DEPARTMENT: "Department",
  ROLES: "Roles *",
  FOR_FREELANCER: "For Freelancer",
  SLAB_PERCENTAGE: "Slab Percentage",
  BRANCH: "Branch",
};

// Button Labels
export const BUTTON_LABELS = {
  CANCEL: "Cancel",
  SAVE: "Save",
  ADD: "Add",
  EDIT_USER: "Edit User",
  ADD_USER: "Add User",
};

// Import shared constants from leads for consistency
export { GRADIENTS, COMMON_STYLES } from "@/constants/leads";
