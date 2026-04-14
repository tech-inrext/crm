import type { SxProps, Theme } from "@mui/material";

export const cardContainerSx: SxProps<Theme> = {
  position: "relative",
  "& .fill-form-btn": {
    opacity: 1,
    transition: "all 0.2s ease-in-out",
  },
} as const;

export const fillFormButtonContainerSx: SxProps<Theme> = {
  position: "absolute",
  top: 16,
  right: 16,
  zIndex: 1,
} as const;

export const fillFormButtonSx: SxProps<Theme> = {
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(8px)",
  border: "1px solid",
  borderColor: "primary.light",
  color: "primary.main",
  fontWeight: 600,
  fontSize: "0.8125rem",
  px: 2,
  py: 0.5,
  borderRadius: 2,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  "&:hover": {
    background: "rgba(25, 118, 210, 0.08)",
    borderColor: "primary.main",
    color: "primary.main",
  },
} as const;
