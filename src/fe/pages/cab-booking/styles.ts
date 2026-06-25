import { SxProps, Theme } from "@mui/material";

export const containerSx: SxProps<Theme> = {
  p: { xs: 1, sm: 2 },
  height: "calc(100vh - 64px)",
  width: "100%",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
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
  p: 0,
  flex: 1,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "transparent",
  backgroundImage: "none",
  boxShadow: "none",
};

export const scrollContainerSx: SxProps<Theme> = {
  flex: 1,
  overflowY: "auto",
  pr: 1,
  pt: 0,
  pb: 2,
};

export const paginationContainerSx: SxProps<Theme> = {
  mt: "auto",
  pt: 1,
};

export const statusFilterContainerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2,
  mb: 2,
  px: 2,
};
