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
