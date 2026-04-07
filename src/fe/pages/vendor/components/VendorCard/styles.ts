import { SxProps, Theme } from "@mui/material";

export const cardRoot: SxProps<Theme> = {
  my: 1,
  mx: { xs: "auto", sm: 0 },
  borderRadius: 4,
  p: 2.5,
  width: { xs: "95%", sm: 300 },
  minHeight: 180,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  background: "#ffffff",
  border: "1px solid rgba(0, 0, 0, 0.06)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.1)",
    borderColor: "primary.main",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "3px",
    background: "primary.main",
    opacity: 0.1,
  },
};

export const headerBox: SxProps<Theme> = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  mb: 2.5,
};

export const avatar: SxProps<Theme> = {
  width: 56,
  height: 56,
  fontWeight: 700,
  fontSize: 20,
  bgcolor: "primary.main",
  color: "white",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
};

export const nameContainer: SxProps<Theme> = {
  minWidth: 0,
  flex: 1,
  ml: 2,
};

export const emailText: SxProps<Theme> = {
  fontSize: "0.85rem",
  color: "text.secondary",
  mt: 0.5,
  fontWeight: 500,
};

export const designationChip: SxProps<Theme> = {
  mt: 1,
  height: 24,
  fontSize: "0.75rem",
  fontWeight: 600,
  bgcolor: "rgba(0, 0, 0, 0.04)",
  color: "text.primary",
};

export const editButton: SxProps<Theme> = {
  background: "rgba(0, 0, 0, 0.03)",
  color: "text.secondary",
  transition: "all 0.2s ease",
  marginLeft: 1,
  "&:hover": {
    color: "primary.main",
    background: "rgba(37, 99, 235, 0.1)",
    transform: "scale(1.1)",
  },
};

export const cardContent: SxProps<Theme> = {
  py: 0,
  px: 0,
};

export const contactItem: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  mb: 1.5,
};

export const iconShell: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: "50%",
  bgcolor: "rgba(0, 0, 0, 0.03)",
  color: "text.secondary",
  flexShrink: 0,
};

export const contactLink: SxProps<Theme> = {
  textDecoration: "none",
  color: "inherit",
  display: "block",
  minWidth: 0,
};

export const contactText: SxProps<Theme> = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "text.primary",
};

export const addressIcon: SxProps<Theme> = {
  fontSize: 18,
};

export const spacer: SxProps<Theme> = {
  height: 0,
};
