export const containerSx = {
  p: { xs: 2, md: 4 },
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#f4f7fc", // Soft premium background
  minHeight: "100vh",
};

export const tabsWrapperSx = {
  borderBottom: 1,
  borderColor: "divider",
  mb: 3,
  backgroundColor: "white",
  borderRadius: "12px 12px 0 0",
  px: 2,
  boxShadow: "0px 2px 10px rgba(0,0,0,0.03)",
};

export const tabsSx = {
  "& .MuiTabs-indicator": {
    backgroundColor: "#1976d2",
    height: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
};

export const tabSx = {
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  minWidth: 140,
  py: 2,
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
    backgroundColor: "rgba(25, 118, 210, 0.04)",
    borderRadius: "8px 8px 0 0",
  },
  transition: "all 0.3s ease",
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
  overflowY: "auto",
  p: { xs: 2, md: 3 },
  backgroundColor: "white",
  borderRadius: "0 0 12px 12px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
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

