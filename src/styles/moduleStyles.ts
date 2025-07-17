import { SxProps, Theme } from "@mui/material/styles";

// Common layout styles used across all modules
export const MODULE_LAYOUT_STYLES = {
  // Main container styles
  mainContainer: {
    p: { xs: 0.5, sm: 1, md: 2 },
    pt: { xs: 1, sm: 2, md: 3 },
    minHeight: "100vh",
    bgcolor: "background.default",
    overflow: "hidden",
  } as SxProps<Theme>,

  // Header paper styles
  headerPaper: {
    p: { xs: 1, sm: 2, md: 3 },
    borderRadius: { xs: 1, sm: 2, md: 3 },
    mb: { xs: 1, sm: 2, md: 3 },
    mt: { xs: 0.5, sm: 1, md: 2 },
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    overflow: "hidden",
    elevation: 2,
  } as SxProps<Theme>,

  // Module title styles
  moduleTitle: {
    fontWeight: 700,
    color: "text.primary",
    fontSize: { xs: "1.3rem", sm: "2rem", md: "2.5rem" },
    mb: { xs: 1.5, md: 3 },
    textAlign: { xs: "center", sm: "left" },
  } as SxProps<Theme>,

  // Loading container
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    mt: 4,
  } as SxProps<Theme>,

  // Empty state container
  emptyStateContainer: {
    textAlign: "center",
    mt: 4,
  } as SxProps<Theme>,

  // Mobile FAB styles
  mobileFab: {
    position: "fixed",
    bottom: 24,
    right: 24,
    display: { xs: "flex", md: "none" },
    zIndex: 1201,
    boxShadow: 3,
  } as SxProps<Theme>,
};

// Leads module specific styles
export const LEADS_STYLES = {
  // Leads main container with additional top margin
  leadsContainer: {
    p: { xs: 0.5, sm: 1, md: 2 },
    pt: { xs: 1, sm: 2, md: 3 },
    mt: { xs: 2, sm: 3, md: 4 }, // Additional top margin for leads module
    minHeight: "100vh",
    bgcolor: "background.default",
    overflow: "hidden",
  } as SxProps<Theme>,

  // Stats grid container
  statsGrid: {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      md: "repeat(4, 1fr)",
    },
    gap: { xs: 1, sm: 2, md: 3 },
    mb: { xs: 1, sm: 2, md: 3 },
  } as SxProps<Theme>,

  // Cards grid layout
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      lg: "repeat(3, 1fr)",
    },
    gap: { xs: 1.5, sm: 2, md: 3 },
    mb: { xs: 2, sm: 3 },
  } as SxProps<Theme>,

  // Table container wrapper
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    mb: { xs: 2, sm: 3 },
  } as SxProps<Theme>,

  // Table container styles
  tableContainer: {
    minWidth: 600,
    width: "100%",
    height: "calc(100vh - 400px)",
    maxHeight: 600,
    minHeight: 400,
    overflow: "auto",
    elevation: 8,
  } as SxProps<Theme>,

  // Table styles with sticky header
  table: {
    "& .MuiTableHead-root": {
      position: "sticky",
      top: 0,
      zIndex: 100,
      "& .MuiTableRow-root": {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important",
      },
    },
    "& .MuiTableBody-root": {
      "& .MuiTableRow-root:hover": {
        backgroundColor: "action.hover",
      },
    },
  } as SxProps<Theme>,

  // Pagination wrapper
  paginationWrapper: {
    mt: 2,
  } as SxProps<Theme>,
};

// Users module specific styles
export const USERS_STYLES = {
  // Users main container with additional top margin
  usersContainer: {
    p: { xs: 0.5, sm: 1, md: 2 },
    pt: { xs: 1, sm: 2, md: 3 },
    mt: { xs: 2, sm: 3, md: 4 }, // Additional top margin for users module
    minHeight: "100vh",
    bgcolor: "background.default",
    overflow: "hidden",
  } as SxProps<Theme>,

  // Users title with adjusted font size
  usersTitle: {
    fontWeight: 700,
    color: "text.primary",
    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
    mb: { xs: 2, md: 3 },
    textAlign: { xs: "center", sm: "left" },
  } as SxProps<Theme>,

  // Mobile cards grid for users
  mobileCardsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 1.5,
    mb: 2,
  } as SxProps<Theme>,

  // Desktop table wrapper for users
  desktopTableWrapper: {
    width: "100%",
    overflowX: { xs: "auto", md: "visible" },
    mb: { xs: 2, sm: 3 },
  } as SxProps<Theme>,

  // Users table paper container
  usersTablePaper: {
    minWidth: { xs: 600, sm: "100%" },
    width: "100%",
    overflow: "auto",
    maxHeight: { xs: 360, sm: 480, md: 600 },
    position: "relative",
    elevation: 8,
  } as SxProps<Theme>,
};

// Roles module specific styles
export const ROLES_STYLES = {
  // Roles main container with additional top margin
  rolesContainer: {
    p: { xs: 1, sm: 2, md: 3 },
    mt: { xs: 2, sm: 3, md: 4 }, // Additional top margin for roles module
    minHeight: "100vh",
    bgcolor: "background.default",
  } as SxProps<Theme>,

  // Roles title
  rolesTitle: {
    fontWeight: 700,
    color: "text.primary",
    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
    mb: { xs: 2, md: 3 },
    textAlign: { xs: "center", sm: "left" },
  } as SxProps<Theme>,

  // Roles grid layout
  rolesGrid: {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(auto-fill, minmax(240px, 1fr))",
      md: "repeat(auto-fill, minmax(260px, 1fr))",
      lg: "repeat(auto-fill, minmax(280px, 1fr))",
      xl: "repeat(auto-fill, minmax(300px, 1fr))",
    },
    gap: { xs: 2, sm: 2.5, md: 3 },
    mb: { xs: 2, sm: 3 },
    width: "100%",
    alignItems: "stretch",
  } as SxProps<Theme>,

  // Role card wrapper
  roleCardWrapper: {
    display: "flex",
    minHeight: "100%",
  } as SxProps<Theme>,

  // Roles FAB (no zIndex override)
  rolesFab: {
    position: "fixed",
    bottom: 24,
    right: 24,
    display: { xs: "flex", md: "none" },
  } as SxProps<Theme>,
};

// Common component styles that can be reused
export const COMMON_COMPONENT_STYLES = {
  // Standard action button in table rows
  actionButton: {
    minWidth: 0,
    px: 1,
    py: 0.5,
    minHeight: 0,
    lineHeight: 1,
  } as SxProps<Theme>,

  // Responsive table size based on window width
  getResponsiveTableSize: () => {
    if (typeof window !== "undefined" && window.innerWidth < 600) {
      return "small";
    }
    return "medium";
  },
};

// Gradients and other visual constants (moved from leads.ts)
export const VISUAL_CONSTANTS = {
  gradients: {
    button: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
    buttonHover: "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
    card: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    tableHeader: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  
  shadows: {
    card: 3,
    table: 8,
    header: 2,
  },

  borderRadius: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
  },
};

// Combined export for easy importing
export const MODULE_STYLES = {
  layout: MODULE_LAYOUT_STYLES,
  leads: LEADS_STYLES,
  users: USERS_STYLES,
  roles: ROLES_STYLES,
  common: COMMON_COMPONENT_STYLES,
  visual: VISUAL_CONSTANTS,
};

export default MODULE_STYLES;
