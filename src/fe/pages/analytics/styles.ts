import { SxProps, Theme } from "@mui/material";

export const containerSx: SxProps<Theme> = {
  p: { xs: 1, sm: 2 },
  height: "calc(100vh - 64px)",
  width: "100%",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  bgcolor: "#f8f9fa",
};

export const tabsWrapperSx: SxProps<Theme> = {
  width: "100%",
  mb: 2,
};

export const tabsSx: SxProps<Theme> = {
  width: "100%",
  minHeight: 0,
  borderBottom: 1,
  borderColor: "divider",
  "& .MuiTabs-indicator": {
    height: 3,
    borderRadius: "3px 3px 0 0",
  },
  "& *:focus": { outline: "none" },
};

export const tabSx: SxProps<Theme> = {
  minHeight: 0,
  py: 1.5,
  minWidth: { md: 160 },
  textTransform: "none",
  "&.Mui-selected": { color: "primary.main" },
  "&:focus": { outline: "none" },
  "&.Mui-focusVisible": { outline: "none" },
};

export const tabLabelBoxSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 1,
};

export const tabTextTypographySx: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: "0.85rem",
};

export const tabPanelSx: SxProps<Theme> = {
  flex: 1,
  overflowY: "auto",
  pt: 2,
};
