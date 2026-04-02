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
