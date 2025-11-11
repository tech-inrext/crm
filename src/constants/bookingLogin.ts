// constants/bookingLogin.ts
// API Constants
export const BOOKING_LOGIN_API_BASE = "/api/v0/booking-login";

// Pagination Constants
export const BOOKING_LOGIN_ROWS_PER_PAGE_OPTIONS = [5, 10, 15, 25];
export const DEFAULT_PAGE_SIZE = 10;

// File Upload Constants
export const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
export const ALLOWED_FILE_TYPES = [
  'image/jpeg', 
  'image/jpg', 
  'image/png', 
  'image/webp', 
  'application/pdf'
];

// Form Default Values
export const DEFAULT_BOOKING_LOGIN_FORM = {
  projectName: "",
  product: "",
  customer1Name: "",
  customer2Name: "",
  address: "",
  phoneNo: "",
  email: "",
  unitNo: "",
  area: "",
  floor: "", 
  plcType: "percentage", 
  plcValue: "",
  otherCharges1: "",
  paymentPlan: "",
  projectRate: "",
  companyDiscount: "",
  companyLoggedInRate: "", 
  salesPersonDiscountBSP: "",
  salesPersonDiscountPLC: "",
  salesPersonDiscountClub: "",
  salesPersonDiscountOthers: "",
  soldPriceBSP: "",
  soldPricePLC: "",
  soldPriceClub: "",
  soldPriceOthers: "",
  netSoldCopAmount: "",
  bookingAmount: "",
  paymentMode: "cheque", 
  chequeNumber: "",
  transactionId: "",
  cashReceiptNumber: "",
  transactionDate: "",
  bankDetails: "",
  slabPercentage: "50% Sales Executive",
  totalDiscountFromComm: "",
  netApplicableComm: "",
  salesPersonName: "",
  teamHeadName: "",
  teamLeaderName: "",
  businessHead: "",
  status: "draft",
  panImage: null,
  aadharImages: [],
};

// Status Options
export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "default" },
  { value: "submitted", label: "Submitted", color: "primary" },
  { value: "approved", label: "Approved", color: "success" },
  { value: "rejected", label: "Rejected", color: "error" },
];

// PLC Type Options
export const PLC_TYPE_OPTIONS = [
  { value: "percentage", label: "PLC %" },
  { value: "per_sq_ft", label: "PLC / s.q.f.t" },
  { value: "per_sq_yard", label: "PLC / s.q.y.d" },
  { value: "unit", label: "PLC / unit" },
];

// Payment Mode Options
export const PAYMENT_MODE_OPTIONS = [
  { value: "cheque", label: "Cheque" },
  { value: "online", label: "Online" },
  { value: "cash", label: "Cash" },
];

// Slab Percentage Options
export const SLAB_PERCENTAGE_OPTIONS = [
  "50% Sales Executive",
  "60% Manager",
  "70% Senior Manager",
  "80% General Manager",
  "90% A.V.P (Core Member)",
  "95% V.P",
  "100% President",
];

// Table Header Configuration
export const BOOKING_LOGIN_TABLE_HEADER = [
  { label: "Project", dataKey: "projectName" },
  { label: "Customer", dataKey: "customer1Name" },
  { label: "Phone", dataKey: "phoneNo" },
  { label: "Unit No", dataKey: "unitNo" },
  { label: "Area", dataKey: "area" },
  { label: "Status", dataKey: "status" },
  { label: "Created By", dataKey: "createdBy.name" },
  { label: "Actions", component: "action-buttons" },
];

// Search Configuration
export const SEARCH_PLACEHOLDER = "Search by customer name, phone, unit no...";
export const SEARCH_DEBOUNCE_DELAY = 600;

// UI Constants
export const FAB_POSITION = {
  bottom: 24,
  right: 24,
  zIndex: 1201,
};

// Permission Module
export const BOOKING_LOGIN_PERMISSION_MODULE = "booking-login";

// Button Labels
export const BUTTON_LABELS = {
  CANCEL: "Cancel",
  SAVE: "Save",
  ADD: "Add",
  EDIT_BOOKING: "Edit Booking",
  ADD_BOOKING: "Add New Booking",
};

// Import shared constants from leads for consistency
export { GRADIENTS, COMMON_STYLES } from "@/constants/leads";