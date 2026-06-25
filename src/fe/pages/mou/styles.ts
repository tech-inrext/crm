import { SxProps, Theme } from "@mui/material";

export const containerSx: SxProps<Theme> = {
  p: { xs: 1, sm: 2 },
  height: "calc(100vh - 64px)",
  width: "100%",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

export const searchContainerSx: SxProps<Theme> = {
  width: "100%",
  maxWidth: "600px",
  flexGrow: 1,
};

export const tabsWrapperSx: SxProps<Theme> = {
  maxWidth: "1200px",
  width: "100%",
};

export const actionBarButtonsSx: SxProps<Theme> = {
  display: "flex",
  gap: { xs: 1, sm: 2 },
  flexDirection: { xs: "row", sm: "row" },
  alignItems: "center",
  justifyContent: { xs: "center", sm: "flex-start" },
  width: { xs: "100%", sm: "auto" },
};

export const actionBarButtonSx: SxProps<Theme> = {
  flex: { xs: 1, sm: "none" },
  minWidth: { xs: "0", sm: "140px" },
  borderRadius: "10px",
  textTransform: "none",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

export const loadingContainerSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  mt: 4,
};

export const contentGridSx: SxProps<Theme> = {
  flex: 1,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

export const listPaperSx: SxProps<Theme> = {
  p: 2,
  flex: 1,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "transparent",
  backgroundImage: "none",
  boxShadow: "none",
};

export const mouListScrollContainerSx: SxProps<Theme> = {
  flex: 1,
  overflowY: "auto",
  pr: 1,
  pt: 1.5,
  pb: 2,
};

export const paginationContainerSx: SxProps<Theme> = {
  mt: "auto",
  pt: 1,
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

export const badgeTypographySx = (type: "error" | "success"): SxProps<Theme> => ({
  bgcolor: `${type}.main`,
  color: "white",
  px: 1,
  borderRadius: "10px",
  fontWeight: "bold",
  fontSize: "0.65rem",
  lineHeight: 1.5,
  minWidth: "20px",
});

export const tabTextTypographySx: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: "0.85rem",
};
