import { SxProps, Theme } from "@mui/material/styles";

/**
 * SxProps utility wrapper for consistent styling across the component library
 * This module provides type-safe utilities for MUI's sx prop system
 */

// Re-export SxProps type for consistent usage across the component library
export type SxPropsType = SxProps<Theme>;

// Default theme type
export type DefaultSxProps = SxProps<Theme>;

// Utility function to merge SxProps
export const mergeSxProps = (...sxProps: (SxProps<Theme> | undefined)[]): SxProps<Theme> => {
  const filtered = sxProps.filter((sx): sx is SxProps<Theme> => sx !== undefined);
  
  if (filtered.length === 0) return {};
  if (filtered.length === 1) return filtered[0];
  
  // Return an array of SxProps for MUI to handle - MUI supports arrays of SxProps
  return filtered as SxProps<Theme>;
};

// Utility function to create responsive SxProps
export const createResponsiveSx = (
  base: SxProps<Theme>,
  responsive?: Record<string, any>
): SxProps<Theme> => {
  if (!responsive) return base;
  
  // Merge base styles with responsive breakpoint styles
  return { ...base, ...responsive } as SxProps<Theme>;
};

// Common SxProps presets
export const commonSxProps = {
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  fullHeight: {
    height: '100%',
  },
  absolute: {
    position: 'absolute',
  },
  relative: {
    position: 'relative',
  },
  fixed: {
    position: 'fixed',
  },
} as const;

export default SxPropsType;
