import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material";

export const cardSx: SxProps<Theme> = {
  borderRadius: 3,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  background: "linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)",
  border: "1px solid rgba(0,0,0,0.04)",
  position: "relative",
  height: "100%",
  minHeight: "280px",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "visible",
  "&:hover": {
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    transform: "translateY(-2px)",
    borderColor: "rgba(0,0,0,0.08)",
  },
};

export const avatarSx = (bgColor: string): SxProps<Theme> => ({
  width: 52,
  height: 52,
  bgcolor: bgColor,
  fontWeight: 700,
  fontSize: 22,
  flexShrink: 0,
  boxShadow: `0 3px 12px ${alpha(bgColor, 0.25)}`,
  border: `2px solid ${alpha(bgColor, 0.1)}`,
});

export const dividerSx: SxProps<Theme> = {
  my: 2,
  borderStyle: "solid",
  borderColor: "rgba(0,0,0,0.06)",
  opacity: 0.7,
};

export const iconBubbleSx = (color: string): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  borderRadius: 2,
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
