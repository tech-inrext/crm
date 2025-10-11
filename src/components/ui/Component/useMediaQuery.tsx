import { useMediaQuery, useTheme } from "@mui/material";
import type { Breakpoint } from "@mui/material/styles";

interface UseMediaQueryOptions {
  defaultMatches?: boolean;
  matchMedia?: (query: string) => MediaQueryList;
  noSsr?: boolean;
  ssrMatchMedia?: (query: string) => { matches: boolean };
}

// Custom hook wrapper for useMediaQuery
const useMediaQueryComponent = (
  query: string | ((theme: any) => string),
  options?: UseMediaQueryOptions
) => {
  return useMediaQuery(query, options);
};

// Utility hooks for common breakpoints
const useBreakpoint = () => {
  const theme = useTheme();
  
  return {
    isMobile: useMediaQuery(theme.breakpoints.down('sm')),
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'md')),
    isDesktop: useMediaQuery(theme.breakpoints.up('md')),
    isLarge: useMediaQuery(theme.breakpoints.up('lg')),
    isXLarge: useMediaQuery(theme.breakpoints.up('xl')),
  };
};

const useBreakpointUp = (breakpoint: Breakpoint) => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up(breakpoint));
};

const useBreakpointDown = (breakpoint: Breakpoint) => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(breakpoint));
};

export default useMediaQueryComponent;
export { useBreakpoint, useBreakpointUp, useBreakpointDown };
