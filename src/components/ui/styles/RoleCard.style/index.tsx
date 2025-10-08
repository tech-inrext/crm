import { SxProps, Theme } from '@mui/material/styles';

export const roleCardStyles = {
  card: {
    borderRadius: 3,
    transition: "all 0.3s ease",
    boxShadow: "0 2px 12px rgba(25, 118, 210, 0.08)",
    "&:hover": {
      boxShadow: "0 8px 24px rgba(25, 118, 210, 0.2)",
      transform: "translateY(-4px)",
      "& .role-avatar": { transform: "scale(1.05)" },
      "& .edit-button": { backgroundColor: "primary.main", color: "white" },
    },
    border: "1px solid rgba(25, 118, 210, 0.12)",
    background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
    width: "100%",
    height: "100%",
    cursor: "pointer",
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      background: "linear-gradient(90deg, #1976d2, #42a5f5)",
    },
  } as SxProps<Theme>,

  avatar: {
    width: { xs: 32, sm: 40 },
    height: { xs: 32, sm: 40 },
    background: "linear-gradient(135deg, #1976d2, #42a5f5)",
    transition: "transform 0.3s ease",
    fontSize: { xs: "0.9rem", sm: "1rem" },
  } as SxProps<Theme>,

  title: {
    fontSize: { xs: "0.95rem", sm: "1.05rem" },
    fontWeight: 700,
    background: "linear-gradient(45deg, #1976d2, #42a5f5)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  } as SxProps<Theme>,

  editButton: {
    width: 28,
    height: 28,
    backgroundColor: "rgba(25, 118, 210, 0.08)",
    color: "primary.main",
    borderRadius: 2,
    transition: "all 0.3s ease",
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
    borderRadius: 3,
    background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
    minWidth: { xs: "unset", sm: "400px", md: "500px" },
    maxWidth: { xs: "100%", sm: "90vw", md: "600px" },
    width: { xs: "100%", sm: "auto" },
  } as SxProps<Theme>,

  dialogMobile: {
    minWidth: "unset",
    maxWidth: "95vw",
    width: "95vw",
    maxHeight: "90vh",
    margin: 1,
    borderRadius: 2,
  } as SxProps<Theme>,

  dialogTablet: {
    minWidth: "320px",
    maxWidth: "90vw",
    margin: 1,
  } as SxProps<Theme>,

  dialogTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
    pb: 1,
    background: "linear-gradient(135deg, #1976d2, #42a5f5)",
    color: "white",
    m: 0,
  } as SxProps<Theme>,

  dialogTitleMobile: {
    px: 2,
    py: 1.5,
  } as SxProps<Theme>,

  titleBox: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  } as SxProps<Theme>,

  titleText: {
    fontWeight: 700,
  } as SxProps<Theme>,

  titleTextMobile: {
    fontSize: "1rem",
    lineHeight: 1.2,
  } as SxProps<Theme>,

  titleTextDesktop: {
    fontSize: "1.25rem",
  } as SxProps<Theme>,

  securityIcon: {
    fontSize: { xs: 20, sm: 24 },
  } as SxProps<Theme>,

  closeButton: {
    color: "white",
    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
  } as SxProps<Theme>,

  dialogContent: {
    p: { xs: 2, sm: 2, md: 3 },
    maxHeight: { xs: "calc(100vh - 120px)", sm: "70vh" },
    overflow: "auto",
  } as SxProps<Theme>,

  dialogContentMobile: {
    px: 2,
    py: 2,
    maxHeight: "60vh",
    overflow: "auto",
  } as SxProps<Theme>,

  dialogContentTablet: {
    px: 2,
    py: 2,
  } as SxProps<Theme>,

  noPermissionsBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    py: 4,
    textAlign: "center",
  } as SxProps<Theme>,

  noPermissionsBoxMobile: {
    py: 3,
    px: 1,
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
    border: "1px solid rgba(25, 118, 210, 0.12)",
    background: "rgba(25, 118, 210, 0.02)",
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
    p: { xs: 2, sm: 2, md: 3 },
    pt: { xs: 1, sm: 1, md: 0 },
    justifyContent: { xs: "stretch", sm: "flex-end" },
  } as SxProps<Theme>,

  dialogActionsMobile: {
    px: 2,
    py: 1.5,
  } as SxProps<Theme>,

  dialogActionsTablet: {
    px: 2,
    py: 2,
  } as SxProps<Theme>,

  closeActionButton: {
    background: "linear-gradient(135deg, #1976d2, #42a5f5)",
    "&:hover": {
      background: "linear-gradient(135deg, #1565c0, #1976d2)",
    },
  } as SxProps<Theme>,

  closeActionButtonMobile: {
    minHeight: "44px",
    fontSize: "1rem",
  } as SxProps<Theme>,
};
