export const HIERARCHY_COLORS = [
  "#3f51b5",
  "#00bcd4",
  "#4caf50",
  "#ff9800",
  "#e91e63",
] as const;

export const STORAGE_KEYS = {
  SELECTED_MANAGER: "selectedTeamManager",
} as const;

export const DEBOUNCE_DELAY = 300;

export const API_ENDPOINTS = {
  EMPLOYEE_PROFILE: "/api/v0/employee/loggedInUserProfile",
  EMPLOYEE_LIST: "/api/v0/employee/getAllEmployeeList",
  HIERARCHY: "/api/v0/employee/hierarchy",
} as const;
