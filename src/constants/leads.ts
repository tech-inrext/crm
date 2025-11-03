export const API_BASE = "/api/v0/lead";
export const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export const EMPLOYEE_API_BASE = "/api/v0/employee";
export const EMPLOYEE_ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export const ROLE_API_BASE = "/api/v0/role";
export const LOCAL_ROLE_NAMES_KEY = "roleNames";
export const ROLE_PERMISSIONS = ["read", "write", "delete"];

// Import visual constants from existing styles
import { VISUAL_CONSTANTS } from "@/styles/moduleStyles";
import {
  COMMON_STYLES as LEADS_COMMON_STYLES,
  GRADIENTS as LEADS_GRADIENTS,
} from "@/components/leads/styles";

export const GRADIENTS = LEADS_GRADIENTS;
export const COMMON_STYLES = LEADS_COMMON_STYLES;

// Lead status values used across the leads feature
export const LEAD_STATUSES = [
  "",
  "New",
  "Not Interested",
  "Not Connected",
  "Follow-up",
  "Call Back",
  "Details Shared",
  "Site Visit Done",
  "Closed",
];
