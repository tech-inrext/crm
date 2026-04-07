import { SxProps, Theme } from "@mui/material";

export const cardRoot: SxProps<Theme> = {
  my: 1,
  mx: { xs: "auto", sm: 0 },
  borderRadius: 4,
  p: 3,
  width: { xs: "95%", sm: 290 },
  minHeight: 140,
  boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(243,247,255,0.7) 100%)",
  transition: "transform 0.18s ease, box-shadow 0.18s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 10px 30px rgba(16,24,40,0.12)",
  },
  display: "flex",
  flexDirection: "column",
  gap: 1,
  justifyContent: "space-between",
};

export const headerBox: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

export const avatar: SxProps<Theme> = {
  width: 48,
  height: 48,
  fontWeight: 700,
  fontSize: 16,
  bgcolor: "primary.main",
  color: "white",
  boxShadow: 3,
};

export const nameContainer: SxProps<Theme> = {
  minWidth: 0,
};

export const emailText: SxProps<Theme> = {
  fontSize: 13,
};

export const designationChip: SxProps<Theme> = {
  mt: 0.6,
};

export const editButton: SxProps<Theme> = {
  background: "#ffffff",
  boxShadow: 1,
};

export const cardContent: SxProps<Theme> = {
  py: 0,
  px: 0,
};

export const contactLink: SxProps<Theme> = {
  textDecoration: "none",
};

export const contactText: SxProps<Theme> = {
  minWidth: 0,
};

export const addressIcon: SxProps<Theme> = {
  mt: 0.1,
};

export const spacer: SxProps<Theme> = {
  height: 2,
};
