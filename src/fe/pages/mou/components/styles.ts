import { SxProps, Theme } from "@mui/material";

export const cardPaperSx: SxProps<Theme> = {
  p: 4,
  position: "relative",
  borderRadius: 3,
  minHeight: 170,
  transition: "transform 150ms ease, box-shadow 150ms ease",
  "&:hover": { transform: "translateY(-6px)", boxShadow: 8 },
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

export const mainStackSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
};

export const headerStackSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  gap: 2,
};

export const infoStackSx: SxProps<Theme> = {
  display: "flex",
  gap: 2,
  alignItems: "center",
};

export const avatarSx: SxProps<Theme> = {
  bgcolor: "primary.main",
  width: 56,
  height: 56,
  fontSize: 18,
};

export const nameSx: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: 18,
};

export const emailSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 14,
  mt: 0.5,
};

export const designationSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 13,
  mt: 0.5,
};

export const actionWrapperSx: SxProps<Theme> = {
  mt: 2,
  display: "flex",
  flexDirection: "column",
  gap: 1,
};

export const buttonGroupSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  gap: 2,
  pt: 1,
};

export const approveBtnSx: SxProps<Theme> = {
  textTransform: "none",
  fontWeight: 700,
  minWidth: 140,
  borderRadius: 2,
};

export const rejectBtnSx: SxProps<Theme> = {
  textTransform: "none",
  fontWeight: 700,
  minWidth: 120,
  borderRadius: 2,
};

export const previewBtnSx: SxProps<Theme> = {
  textTransform: "none",
  fontWeight: 700,
  minWidth: 120,
  borderRadius: 2,
};

export const resendBtnSx: SxProps<Theme> = {
  textTransform: "none",
  fontWeight: 700,
  minWidth: 140,
  borderRadius: 2,
};

export const statusChipSx: SxProps<Theme> = {
  position: "absolute",
  top: 12,
  right: 12,
  textTransform: "none",
  fontWeight: 600,
};
