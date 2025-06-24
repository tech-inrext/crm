export const API_BASE = "/api/v0/lead";
export const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export const EMPLOYEE_API_BASE = "/api/v0/employee";
export const EMPLOYEE_ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export const ROLE_API_BASE = "/api/v0/role";
export const LOCAL_ROLE_NAMES_KEY = "roleNames";
export const ROLE_PERMISSIONS = ["read", "write", "delete"];

export const GRADIENTS = {
  button: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
  buttonHover: "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
  card: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
};

export const COMMON_STYLES = {
  roundedPaper: {
    borderRadius: { xs: 2, sm: 3, md: 4 },
    overflow: "hidden",
  },
  iconButton: (mainColor: string, hoverColor: string) => ({
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: `1px solid ${mainColor}`,
    color: mainColor,
    "&:hover": {
      backgroundColor: hoverColor,
      color: "white",
      transform: "scale(1.05)",
    },
    transition: "all 0.2s ease-in-out",
  }),
};
