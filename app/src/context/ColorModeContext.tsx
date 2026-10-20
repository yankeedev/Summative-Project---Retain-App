import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeProvider, type PaletteMode } from "@mui/material/styles";
import { buildTheme } from "../theme";

const MODE_KEY = "retain.mode";

interface ColorModeContextValue {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
}

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

function readStoredMode(): PaletteMode {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    return stored === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(readStoredMode);

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const theme = useMemo(() => buildTheme(mode), [mode]);
  const value = useMemo<ColorModeContextValue>(() => ({ mode, setMode }), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode(): ColorModeContextValue {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error("useColorMode must be used inside <ColorModeProvider>");
  return ctx;
}
