"use client";
import * as React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createCache from "@emotion/cache";
import { useThemeContext } from "../../../contexts/ThemeContext";
import { createAppTheme } from "../../../styles/theme";

// Create emotion cache
const createEmotionCache = () => {
  return createCache({ key: "css", prepend: true });
};

const clientSideEmotionCache = createEmotionCache();

export default function MuiRootProvider({
  children,
  emotionCache = clientSideEmotionCache,
}: {
  children: React.ReactNode;
  emotionCache?: EmotionCache;
}) {
  const { mode } = useThemeContext();
  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
