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
