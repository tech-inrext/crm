"use client";
import * as React from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createCache from "@emotion/cache";

// Create emotion cache
const createEmotionCache = () => {
  return createCache({ key: "css", prepend: true });
};

const clientSideEmotionCache = createEmotionCache();

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

export default function MuiRootProvider({
  children,
  emotionCache = clientSideEmotionCache,
}: {
  children: React.ReactNode;
  emotionCache?: EmotionCache;
}) {
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
