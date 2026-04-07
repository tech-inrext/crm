import type { SxProps, Theme } from "@mui/material";

/** 
 * Shared Grid layout for vendors list and skeletons 
 */
export const vendorsGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
  gap: 3,
  mt: 2,
} as const;

/** 
 * Empty state styles 
 */
export const emptyStateContainerSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center", // Fixing typo from 'itemsAlign' in source
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
 * Vendors List specific styles 
 */
export const paginationContainerSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  mt: 6,
} as const;

/** 
 * Page Action Bar styles 
 */
export const searchBarSx: SxProps<Theme> = {
  width: "100%",
  minWidth: 280,
} as const;

/** 
 * Skeleton specific overrides 
 */
export const skeletonBadgeSx: SxProps<Theme> = {
  borderRadius: 16,
  mt: 0.6,
} as const;
