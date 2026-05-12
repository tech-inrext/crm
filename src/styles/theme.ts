import { createTheme, ThemeOptions } from "@mui/material/styles";

export const getThemeOptions = (mode: "light" | "dark"): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // Light mode palette
          primary: {
            main: "#1a1a1a",
            light: "#424242",
            dark: "#000000",
          },
          secondary: {
            main: "#6366f1",
          },
          background: {
            default: "#f8fafc",
            paper: "#ffffff",
          },
          text: {
            primary: "#1e293b",
            secondary: "#64748b",
          },
        }
      : {
          // Premium dark mode palette
          primary: {
            main: "#ffffff",
            light: "#f3f4f6",
            dark: "#d1d5db",
          },
          secondary: {
            main: "#818cf8",
          },
          background: {
            default: "#0f172a", // Deep slate
            paper: "#1e293b",   // Slate 800
          },
          text: {
            primary: "#f1f5f9",
            secondary: "#94a3b8",
          },
          divider: "rgba(255, 255, 255, 0.1)",
        }),
  },
  typography: {
    fontFamily: "var(--font-geist-sans), sans-serif",
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: "12px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: mode === "dark" 
            ? "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)" 
            : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        },
      },
    },
  },
});

export const createAppTheme = (mode: "light" | "dark") => {
  return createTheme(getThemeOptions(mode));
};
