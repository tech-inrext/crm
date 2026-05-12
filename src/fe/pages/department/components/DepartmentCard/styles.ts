import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material";

export const cardSx: SxProps<Theme> = {
  borderRadius: 3,
  boxShadow: (theme) => theme.palette.mode === 'dark' 
    ? "0 4px 12px rgba(0,0,0,0.4)" 
    : "0 2px 8px rgba(0,0,0,0.06)",
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  position: "relative",
  height: "100%",
  minHeight: "220px",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "hidden",
  "&:hover": {
    boxShadow: (theme) => theme.palette.mode === 'dark' 
      ? "0 12px 30px rgba(0,0,0,0.6)" 
      : "0 8px 25px rgba(0,0,0,0.1)",
    transform: "translateY(-2px)",
    borderColor: "primary.main",
  },
};

export const avatarSx = (bgColor: string): SxProps<Theme> => ({
  width: 44,
  height: 44,
  bgcolor: bgColor,
  fontWeight: 700,
  fontSize: 18,
  flexShrink: 0,
  boxShadow: `0 3px 12px ${alpha(bgColor, 0.25)}`,
  border: `2px solid ${alpha(bgColor, 0.1)}`,
});

export const dividerSx: SxProps<Theme> = {
  my: 1.5,
  borderStyle: "solid",
  borderColor: "divider",
  opacity: 0.7,
};

export const iconBubbleSx = (color: string): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: 1.5,
  bgcolor: alpha(color, 0.08),
  color,
  flexShrink: 0,
  mr: 2,
  border: `1px solid ${alpha(color, 0.15)}`,
  transition: "all 0.2s ease",
});

export const editBtnSx = (color: string): SxProps<Theme> => ({
  color,
  bgcolor: alpha(color, 0.06),
  borderRadius: 2,
  border: `1px solid ${alpha(color, 0.15)}`,
  transition: "all 0.2s ease",
  "&:hover": {
    bgcolor: alpha(color, 0.15),
    borderColor: alpha(color, 0.25),
    transform: "scale(1.05)",
  },
});
