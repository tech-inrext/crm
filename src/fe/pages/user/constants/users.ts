// ─── API Constants ────────────────────────────────────────────────────────────
export const USERS_API_BASE = "/api/v0/employee";
export const ROLES_API_BASE = "/api/v0/role";
export const DEPARTMENTS_API_BASE = "/api/v0/department";

// ─── Pagination ───────────────────────────────────────────────────────────────
export const USERS_ROWS_PER_PAGE_OPTIONS = [5, 10, 15, 25] as const;
export const DEFAULT_PAGE_SIZE = 10;

// ─── Form defaults ────────────────────────────────────────────────────────────
export const DEFAULT_USER_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  gender: "Male",
  dateOfBirth: "",
  whatsapp: "",
  fatherName: "",
  specialization: "",
  joiningDate: "",
  designation: "",
  managerId: "",
  departmentId: "",
  roles: [] as string[],
  panNumber: "",
  slabPercentage: "",
  branch: "",
  // Document files (pre-upload)
  aadharFile: null as File | null,
  panFile: null as File | null,
  bankProofFile: null as File | null,
  signatureFile: null as File | null,
  photoFile: null as File | null,
  // Document URLs (post-upload)
  aadharUrl: "",
  panUrl: "",
  bankProofUrl: "",
  signatureUrl: "",
  photo: "",
  nominee: null as null | {
    name?: string;
    phone?: string;
    occupation?: string;
    relation?: string;
    gender?: string;
  },
};

// ─── Options ──────────────────────────────────────────────────────────────────
export const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

// ─── Table header config ──────────────────────────────────────────────────────
export const USERS_TABLE_HEADER = [
  { label: "Name", dataKey: "name" },
  { label: "Email", dataKey: "email" },
  { label: "Phone", dataKey: "phone" },
  { label: "Designation", dataKey: "designation" },
  { label: "Actions", component: "action-buttons" },
] as const;

// ─── Search ───────────────────────────────────────────────────────────────────
export const SEARCH_PLACEHOLDER = "Search users by name, email, phone…";
export const SEARCH_DEBOUNCE_DELAY = 600;

// ─── UI ───────────────────────────────────────────────────────────────────────
export const FAB_POSITION = { bottom: 24, right: 24, zIndex: 1201 } as const;

// ─── Permissions ──────────────────────────────────────────────────────────────
export const USERS_PERMISSION_MODULE = "employee";

// ─── Validation ───────────────────────────────────────────────────────────────
export const VALIDATION_RULES = {
  NAME: { min: 3, max: 50 },
  ADDRESS: { min: 5 },
  AGE: { min: 0, max: 120 },
  DESIGNATION: { min: 2, max: 50 },
} as const;

// ─── Labels ───────────────────────────────────────────────────────────────────
export const FIELD_LABELS = {
  BASIC_INFO: "Basic Information",
  ORGANIZATION: "Organization",
  FULL_NAME: "Full Name *",
  AADHAR: "Aadhar Card (Max 1 MB)",
  PAN: "PAN Card (Max 1 MB)",
  BANK_PROOF: "Bank Proof (Max 1 MB)",
  SIGNATURE: "Signature (Max 1 MB)",
  PHOTO: "Photo (Max 1 MB)",
  EMAIL: "Email *",
  PHONE: "Phone *",
  ALT_PHONE: "WhatsApp Number",
  FATHER_NAME: "Father's Name *",
  SPECIALIZATION: "Specialization",
  ADDRESS: "Address *",
  GENDER: "Gender *",
  DATE_OF_BIRTH: "Date of Birth",
  NOMINEE_DETAILS: "Nominee Details",
  NOMINEE_FULL_NAME: "Full Name",
  NOMINEE_PHONE: "Phone Number",
  NOMINEE_OCCUPATION: "Occupation",
  NOMINEE_RELATION: "Relation with Nominee",
  JOINING_DATE: "Joining Date",
  DESIGNATION: "Designation *",
  MANAGER: "Manager *",
  DEPARTMENT: "Department",
  ROLES: "Roles *",
  FOR_FREELANCER: "For Freelancer",
  SLAB_PERCENTAGE: "Slab Percentage",
  BRANCH: "Branch",
  PAN_NUMBER: "PAN Number *",
} as const;

export const BUTTON_LABELS = {
  CANCEL: "Cancel",
  SAVE: "Save",
  ADD: "Add",
  EDIT_USER: "Edit User",
  ADD_USER: "Add User",
} as const;

// ─── Shared style tokens ──────────────────────────────────────────────────────
export { GRADIENTS, COMMON_STYLES } from "@/constants/leads";
