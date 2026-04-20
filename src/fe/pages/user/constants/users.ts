import { Email, Phone } from "@mui/icons-material";
import { DocumentConfig } from "@/fe/pages/user/types/documents";
// ─── API Constants ────────────────────────────────────────────────────────────
export const USERS_API_BASE = "/api/v0/employee";
export const ROLES_API_BASE = "/api/v0/role";
export const DEPARTMENTS_API_BASE = "/api/v0/department";

export const USER_CACHE_KEYS = {
  /** Invalidates entire employee list (all pages / searches) */
  EMPLOYEES: USERS_API_BASE,
  /** Invalidates a single employee entry — pass the full URL: `${USERS_API_BASE}/${id}` */
  EMPLOYEE_BY_ID: (id: string) => `${USERS_API_BASE}/${id}`,
  /** Invalidates all role-list cache entries */
  ROLES: "/api/v0/role",
  /** Invalidates all department cache entries */
  DEPARTMENTS: DEPARTMENTS_API_BASE,
} as const;
export const USERS_ROWS_PER_PAGE_OPTIONS = [5, 10, 15, 25] as const;
export const DEFAULT_PAGE_SIZE = 5;

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

export type BranchKey = "Noida" | "Lucknow" | "Patna" | "Delhi";

export const BRANCH_LABELS: Record<BranchKey, string> = {
  Noida:
    "Noida: 3rd floor, D4, Block -D, Sector -10, Noida, Uttar Pradesh 201301.",
  Lucknow: "Lucknow: 312, Felix, Square, Sushant Golf City, Lucknow 226030.",
  Patna:
    "Patna: 4th floor, Pandey Plaza, Exhibition Road, Patna, Bihar 800001.",
  Delhi: "Plot No. 29, 4th Floor, Moti Nagar, New Delhi-110015",
};

export const SLAB_OPTIONS: string[] = [
  "",
  "100",
  "95",
  "90",
  "85",
  "80",
  "70",
  "60",
  "50",
];

export const SLAB_LABELS: Record<string, string> = {
  "100": "100% DIRECTOR",
  "95": "95% ADDITIONAL DIRECTOR",
  "90": "90% PRESIDENT",
  "85": "85% VICE PRESIDENT",
  "80": "80% GENERAL MANAGER",
  "70": "70% SENIOR MANAGER",
  "60": "60% TEAM MANAGER",
  "50": "50% BUSINESS DEVELOPMENT MANAGER",
};

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

export const DOCUMENTS: DocumentConfig[] = [
  { id: "aadhar-upload", fieldName: "aadharFile", labelKey: "AADHAR" },
  { id: "pan-upload", fieldName: "panFile", labelKey: "PAN" },
  { id: "bank-upload", fieldName: "bankProofFile", labelKey: "BANK_PROOF" },
  { id: "sig-upload", fieldName: "signatureFile", labelKey: "SIGNATURE" },
];

export const getContactPersonalFields = () => [
  { label: "Email", dataKey: "email", icon: Email },
  { label: "Phone", dataKey: "phone", icon: Phone },
  { label: "WhatsApp", dataKey: "altPhone" },
  { label: "Gender", dataKey: "gender" },
  { label: "Date of Birth", dataKey: "dateOfBirth", isDate: true },
  { label: "Specialization", dataKey: "specialization" },
  { label: "Father's Name", dataKey: "fatherName" },
  { label: "Address", dataKey: "address" },
];

export const getOrganizationFields = (
  departmentName: string,
  managerName: string
) => [
  { label: "Designation", dataKey: "designation" },
  { label: "Joining Date", dataKey: "joiningDate", isDate: true },
  {
    label: "Department",
    dataKey: "departmentName",
    isCustom: true,
    customValue: departmentName,
  },
  {
    label: "Manager",
    dataKey: "managerName",
    isCustom: true,
    customValue: managerName,
  },
  { label: "Branch", dataKey: "branch" },
  { label: "Slab Percentage", dataKey: "slabPercentage", suffix: "%" },
];

// ─── Shared style tokens ──────────────────────────────────────────────────────
export { GRADIENTS, COMMON_STYLES } from "@/constants/leads";
