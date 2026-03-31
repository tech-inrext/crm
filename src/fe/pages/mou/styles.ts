import { SxProps, Theme } from "@mui/material";

export const containerSx: SxProps<Theme> = {
  p: { xs: 1, sm: 2, md: 3 },
  pt: { xs: 2, sm: 3, md: 4 },
  minHeight: "100vh",
  bgcolor: "background.default",
  width: "100%",
  overflow: "hidden",
};

export const headerPaperSx: SxProps<Theme> = {
  p: 2,
  mb: 2,
};

export const headerContentSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const titleSx: SxProps<Theme> = {
  fontWeight: 700,
};

export const tabButtonsContainerSx: SxProps<Theme> = {
  display: "flex",
  gap: 1,
  mb: 2,
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
