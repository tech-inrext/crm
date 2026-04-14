import { SxProps, Theme } from "@mui/material";

export const containerSx: SxProps<Theme> = {
  p: { xs: 1, sm: 2, md: 3 },
  pt: { xs: 2, sm: 3, md: 4 },
  minHeight: "100vh",
  bgcolor: "background.default",
  width: "100%",
  overflow: "hidden",
};

export const searchContainerSx: SxProps<Theme> = {
  width: "100%",
  maxWidth: "600px",
  flexGrow: 1,
};

export const tabsWrapperSx: SxProps<Theme> = {
  mt: 2,
  mb: 2,
  maxWidth: "1200px",
  mx: "auto",
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
  display: "grid",
  gap: 2,
};

export const listPaperSx: SxProps<Theme> = {
  p: 2,
};

export const listTitleSx: SxProps<Theme> = {
  fontWeight: 600,
  mb: 1,
};

export const paginationContainerSx: SxProps<Theme> = {
  mt: 2,
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
  textTransform: "none",
  "&.Mui-selected": { color: "primary.main" },
  "&:focus": { outline: "none" },
  "&.Mui-focusVisible": { outline: "none" },
};

export const tabLabelBoxSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 0.5,
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
