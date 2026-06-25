import type { SxProps, Theme } from "@mui/material";

/** 
 * Shared Grid layout for booking list and skeletons 
 */
export const bookingGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 3,
  mt: 2,
} as const;

/** 
 * Empty state styles 
 */
export const emptyStateContainerSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  py: 10,
  textAlign: "center",
  color: "text.secondary",
} as const;

export const emptyStateIconContainerSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  mb: 2,
  opacity: 0.5,
} as const;

export const emptyStateIconSx: SxProps<Theme> = {
  fontSize: 60,
} as const;

export const emptyStateDescriptionSx: SxProps<Theme> = {
  maxWidth: 300,
  mx: "auto",
  opacity: 0.7,
} as const;

/** 
 * Action Bar styles 
 */
export const actionBarContainerSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mb: 4,
} as const;

/** 
 * Skeleton specific overrides 
 */
export const skeletonBadgeSx: SxProps<Theme> = {
  borderRadius: 16,
  mt: 0.6,
} as const;

export const skeletonCardSx: SxProps<Theme> = {
  p: 2,
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 2,
} as const;

/**
 * Shared MUI TextField sx prop used across vendor booking forms
 */
export const inputSx: SxProps<Theme> = {
  bgcolor: "#fff",
  borderRadius: 1,
  "& .MuiInputBase-root": { minHeight: 40 },
  "& .MuiInputBase-input": { py: 1, fontSize: "0.875rem" },
  "& .MuiInputLabel-root": { fontSize: "0.875rem" },
} as const;

/**
 * Section title styling for forms
 */
export const formSectionTitleSx: SxProps<Theme> = {
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "text.primary",
  mb: 1.5,
  mt: 1,
} as const;

/**
 * Main vertical layout for form sections
 */
export const formContainerSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
} as const;

/**
 * File upload button base styling
 */
export const fileUploadButtonSx: SxProps<Theme> = {
  height: 40,
  justifyContent: "space-between",
  px: 1.5,
  textTransform: "none",
  color: "text.primary",
  fontSize: "0.875rem",
  fontWeight: 400,
  "&:hover": {
    background: "rgba(25, 118, 210, 0.08)",
    borderColor: "primary.main",
    color: "primary.main",
  },
} as const;

/**
 * Uploaded file name styling (caption/body2)
 */
export const fileNameSx: SxProps<Theme> = {
  maxWidth: "70%",
} as const;

/**
 * "CHOOSE" label inside upload button
 */
export const chooseTextSx: SxProps<Theme> = {
  color: "primary.main",
  fontWeight: 600,
} as const;

/**
 * Error message for file uploads
 */
export const errorTextSx: SxProps<Theme> = {
  mt: 0.5,
  display: "block",
  ml: 1,
} as const;

/**
 * Image preview container
 */
export const imagePreviewBoxSx: SxProps<Theme> = {
  mt: 1,
  position: "relative",
  width: 60,
  height: 40,
} as const;

/**
 * Read-only total KM field styling
 */
export const totalKmFieldSx: SxProps<Theme> = {
  ...inputSx,
  "& .MuiInputBase-root": {
    ...inputSx["& .MuiInputBase-root"],
    bgcolor: "rgba(25, 118, 210, 0.04)",
  },
  "& .MuiInputBase-input": {
    ...inputSx["& .MuiInputBase-input" as any],
    color: "primary.main",
    fontWeight: 700,
  },
} as const;
