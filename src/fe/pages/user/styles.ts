// Module-local styles for the users module.
// These were copied from the global `MODULE_STYLES` to make the module self-contained.

export const LEADS_STYLES = {
  leadsContainer: {
    p: { xs: 0.5, sm: 1, md: 2 },
    pt: { xs: 1, sm: 2, md: 3 },
    mt: 0,
    height: "calc(100vh - 64px)",
    overflow: "hidden",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      md: "repeat(4, 1fr)",
    },
    gap: { xs: 1, sm: 2, md: 3 },
    mb: { xs: 1, sm: 2, md: 3 },
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      md: "repeat(3, 1fr)",
      lg: "repeat(4, 1fr)",
    },
    height: "calc(100% - 70px)",
    overflowY: "auto",
    gap: { xs: 1.5, sm: 2, md: 3 },
    mb: { xs: 2, sm: 3 },
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    mb: { xs: 2, sm: 3 },
  },
  tableContainer: {
    minWidth: 600,
    width: "100%",
    height: "calc(100vh - 400px)",
    maxHeight: 600,
    minHeight: 400,
    overflow: "auto",
    elevation: 8,
  },
  table: {
    "& .MuiTableHead-root": {
      position: "sticky",
      top: 0,
      zIndex: 100,
      "& .MuiTableRow-root": {
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important",
      },
    },
    "& .MuiTableBody-root": {
      "& .MuiTableRow-root:hover": {
        backgroundColor: "action.hover",
      },
    },
  },
  paginationWrapper: { mt: 2 },
};

export const USERS_STYLES = {
  usersContainer: {
    p: { xs: 0.5, sm: 1, md: 2 },
    pt: { xs: 1, sm: 2, md: 3 },
    mt: 0,
    minHeight: "100vh",
    bgcolor: "background.default",
    overflow: "hidden",
  },
  usersTitle: {
    fontWeight: 700,
    color: "text.primary",
    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
    mb: { xs: 2, md: 3 },
    textAlign: { xs: "center", sm: "left" },
  },
  mobileCardsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 1.5,
    mb: 2,
  },
  desktopTableWrapper: {
    width: "100%",
    overflowX: { xs: "auto", md: "visible" },
    mb: { xs: 2, sm: 3 },
  },
  usersTablePaper: {
    minWidth: { xs: 600, sm: "100%" },
    width: "100%",
    overflow: "auto",
    maxHeight: { xs: 360, sm: 480, md: 600 },
    position: "relative",
    elevation: 8,
  },
};

export const COMMON_STYLES = {
  actionButton: {
    minWidth: 0,
    px: 1,
    py: 0.5,
    minHeight: 0,
    lineHeight: 1,
  },
  getResponsiveTableSize: () => {
    if (typeof window !== "undefined" && window.innerWidth < 600)
      return "small";
    return "medium";
  },
};

export default {
  users: USERS_STYLES,
  leads: LEADS_STYLES,
  common: COMMON_STYLES,
};
