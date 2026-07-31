export const containerSx = {
  p: { xs: 2, md: 3 },
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#f8fafc", // Soft subtle background for floating cards
  minHeight: "100vh",
};

export const tabsWrapperSx = {
  borderBottom: "1px solid #e2e8f0",
  mb: 3,
  backgroundColor: "transparent",
  px: 0,
  boxShadow: "none",
};

export const tabsSx = {
  "& .MuiTabs-indicator": {
    backgroundColor: "#1976d2",
    height: 3,
    borderRadius: 3,
  },
};

export const tabSx = {
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.95rem",
  minWidth: 120,
  py: 1.5,
  color: "#64748b", // Slate 500
  outline: "none",
  "&:focus": {
    outline: "none",
  },
  "&.Mui-selected": {
    color: "#1976d2",
    outline: "none",
  },
  "&:hover": {
    color: "#1976d2",
    backgroundColor: "transparent",
  },
  transition: "all 0.2s ease",
};

export const tabLabelBoxSx = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};

export const tabTextTypographySx = {
  fontWeight: "inherit",
};

export const tabPanelSx = {
  flex: 1,
  p: 0,
  pt: 1,
  backgroundColor: "transparent",
  boxShadow: "none",
};

export const tableContainerSx = {
  borderRadius: 3,
  boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
  border: "1px solid rgba(0,0,0,0.05)",
  overflow: "hidden",
};

export const tableHeaderSx = {
  backgroundColor: "#f8fafc",
  "& th": {
    fontWeight: 700,
    color: "#475569",
    borderBottom: "2px solid #e2e8f0",
    textTransform: "uppercase",
    fontSize: "0.75rem",
    letterSpacing: "0.05em",
    py: 2.5,
  },
};

export const tableRowSx = {
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "#f1f5f9",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
  },
  "& td": {
    borderColor: "#f1f5f9",
    py: 2,
  },
};

export const animatedButtonSx = {
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 600,
  px: 3,
  py: 1,
  boxShadow: "0 4px 14px 0 rgba(25, 118, 210, 0.39)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(25, 118, 210, 0.5)",
  },
};

