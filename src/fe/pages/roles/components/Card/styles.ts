import { SxProps, Theme } from "@/components/ui/Component";

export const roleCardStyles = {
  card: {
    borderRadius: 4,
    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.05)",
    "&:hover": {
      boxShadow: "0 14px 28px rgba(25, 118, 210, 0.12), 0 10px 10px rgba(25, 118, 210, 0.08)",
      transform: "translateY(-4px)",
      borderColor: "rgba(25, 118, 210, 0.3)",
      "& .role-avatar": { 
        transform: "scale(1.08) rotate(-5deg)",
        boxShadow: "0 6px 14px rgba(25, 118, 210, 0.2)"
      },
    },
    border: "1px solid rgba(0, 0, 0, 0.06)",
    background: "#ffffff",
    width: "100%",
    height: "100%",
    minHeight: { xs: "80px", sm: "96px" },
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "4px",
      background: "linear-gradient(90deg, #1976d2, #42a5f5)",
    },
  } as SxProps<Theme>,

  avatar: {
    width: { xs: 46, sm: 54 },
    height: { xs: 46, sm: 54 },
    background: "linear-gradient(135deg, #f0f7ff 0%, #e0efff 100%)",
    color: "#1976d2",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(25, 118, 210, 0.06), inset 0 2px 0 rgba(255, 255, 255, 0.8)",
    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
    fontSize: { xs: "1.2rem", sm: "1.4rem" },
  } as SxProps<Theme>,

  title: {
    fontSize: { xs: "1.05rem", sm: "1.15rem" },
    fontWeight: 700,
    color: "#1e293b",
    letterSpacing: "-0.01em",
    wordBreak: "break-word",
  } as SxProps<Theme>,

  rank: {
    fontSize: "0.85rem",
    color: "#64748b",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 0.75,
    mt: 0.25,
    "&::before": {
      content: '""',
      display: "inline-block",
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      backgroundColor: "#42a5f5",
      opacity: 0.8,
    }
  } as SxProps<Theme>,

  viewButton: {
    width: 38,
    height: 38,
    backgroundColor: "#f8fafc",
    color: "#64748b",
    borderRadius: "10px",
    border: "1px solid #f1f5f9",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#f0f9ff",
      color: "#0288d1",
      borderColor: "#bae6fd",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 10px rgba(2, 136, 209, 0.1)",
    }
  } as SxProps<Theme>,

  editButton: {
    width: 38,
    height: 38,
    backgroundColor: "#f8fafc",
    color: "#64748b",
    borderRadius: "10px",
    border: "1px solid #f1f5f9",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#eff6ff",
      color: "#1976d2",
      borderColor: "#bfdbfe",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 10px rgba(25, 118, 210, 0.1)",
    }
  } as SxProps<Theme>,

  expandedContent: {
    background: "rgba(25, 118, 210, 0.04)",
    borderRadius: 2,
    p: 1.5,
    mt: 1,
  } as SxProps<Theme>,

  permissionsSummary: {
    background: "rgba(25, 118, 210, 0.04)",
    borderRadius: 2,
    p: 1.5,
    mt: 1,
  } as SxProps<Theme>,

  permissionsTitle: {
    fontWeight: 700,
    color: "primary.main",
    textTransform: "uppercase",
    mb: 1,
    display: "block",
  } as SxProps<Theme>,

  loadingGrid: {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(auto-fill, minmax(240px, 1fr))",
      md: "repeat(auto-fill, minmax(260px, 1fr))",
      lg: "repeat(auto-fill, minmax(280px, 1fr))",
      xl: "repeat(auto-fill, minmax(300px, 1fr))",
    },
    gap: { xs: 2, sm: 2.5, md: 3 },
    mt: 2,
  } as SxProps<Theme>,

  loadingCard: {
    p: 2,
    borderRadius: 3,
    border: "1px solid rgba(25, 118, 210, 0.1)",
    background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
  } as SxProps<Theme>,
};

export const permissionColors = {
  read: "#1976d2",
  write: "#ed6c02",
  delete: "#d32f2f",
} as const;

export const rolePermissionsDialogStyles = {
  dialog: {
    borderRadius: { xs: 2, sm: 3 },
    background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
    minWidth: { xs: "unset", sm: "320px", md: "500px" },
    maxWidth: { xs: "95vw", sm: "90vw", md: "600px" },
    width: { xs: "95vw", sm: "auto" },
    maxHeight: { xs: "90vh", sm: "none" },
    margin: { xs: 1, sm: 1, md: "auto" },
  } as SxProps<Theme>,

  dialogTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
    pb: { xs: 1.5, sm: 1 },
    pt: { xs: 1.5, sm: 2 },
    px: { xs: 2, sm: 3 },
    background: "linear-gradient(135deg, #1976d2, #42a5f5)",
    color: "white",
    m: 0,
  } as SxProps<Theme>,

  titleBox: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  } as SxProps<Theme>,

  titleText: {
    fontWeight: 700,
    fontSize: { xs: "1rem", sm: "1.25rem" },
    lineHeight: { xs: 1.2, sm: "normal" },
  } as SxProps<Theme>,

  securityIcon: {
    fontSize: { xs: 20, sm: 24 },
  } as SxProps<Theme>,

  closeButton: {
    color: "white",
    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
  } as SxProps<Theme>,

  dialogContent: {
    px: { xs: 2, md: 3 },
    py: { xs: 2, md: 3 },
    maxHeight: { xs: "60vh", sm: "70vh" },
    overflow: "auto",
  } as SxProps<Theme>,

  noPermissionsBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    py: { xs: 3, sm: 4 },
    px: { xs: 1, sm: 0 },
    textAlign: "center",
  } as SxProps<Theme>,

  noPermissionsIcon: {
    fontSize: { xs: 36, sm: 48 },
    color: "text.secondary",
    mb: 2,
  } as SxProps<Theme>,

  noPermissionsTitle: {
    fontSize: { xs: "1.1rem", sm: "1.25rem" },
  } as SxProps<Theme>,

  noPermissionsText: {
    fontSize: "0.875rem",
    textAlign: "center",
    maxWidth: { xs: "280px", sm: "none" },
  } as SxProps<Theme>,

  gridContainer: {
    spacing: { xs: 2, sm: 3 },
  },

  modulePaper: {
    p: { xs: 1.5, sm: 2 },
    borderRadius: { xs: 1.5, sm: 2 },
    border: "1.5px solid rgba(25, 118, 210, 0.35)",
    background: "rgba(25, 118, 210, 0.07)",
    height: "100%",
  } as SxProps<Theme>,

  moduleTitle: {
    fontWeight: 700,
    color: "primary.main",
    mb: { xs: 1, sm: 1.5 },
    textTransform: "capitalize",
    display: "flex",
    alignItems: "center",
    gap: 1,
    fontSize: { xs: "0.95rem", sm: "1rem" },
  } as SxProps<Theme>,

  moduleDivider: {
    mb: { xs: 1, sm: 1.5 },
  } as SxProps<Theme>,

  moduleActions: {
    display: "flex",
    flexDirection: { xs: "row", sm: "column" },
    flexWrap: { xs: "wrap", sm: "nowrap" },
    gap: { xs: 0.5, sm: 1 },
  } as SxProps<Theme>,

  actionChip: {
    color: "white",
    fontSize: { xs: "0.7rem", sm: "0.75rem" },
    fontWeight: 600,
    justifyContent: "flex-start",
    height: { xs: "24px", sm: "auto" },
    "& .MuiChip-label": {
      px: { xs: 1, sm: 1.5 },
      py: { xs: 0, sm: "auto" },
    },
  } as SxProps<Theme>,

  dialogActions: {
    px: { xs: 2, md: 3 },
    pb: { xs: 1.5, sm: 2, md: 3 },
    pt: { xs: 1.5, sm: 2, md: 0 },
    justifyContent: { xs: "stretch", sm: "flex-end" },
  } as SxProps<Theme>,

  closeActionButton: {
    background: "linear-gradient(135deg, #1976d2, #42a5f5)",
    "&:hover": {
      background: "linear-gradient(135deg, #1565c0, #1976d2)",
    },
    width: { xs: "100%", sm: "auto" },
    minHeight: { xs: "44px", sm: "36px" },
    fontSize: { xs: "1rem", sm: "0.875rem" },
  } as SxProps<Theme>,
};
