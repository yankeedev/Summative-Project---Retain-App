import { createTheme, type PaletteMode } from "@mui/material/styles";

export function buildTheme(mode: PaletteMode) {
  const isLight = mode === "light";
  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#4f46e5", // Indigo 600
        light: "#818cf8",
        dark: "#3730a3",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#0ea5e9", // Sky 500
        light: "#38bdf8",
        dark: "#0284c7",
      },
      success: {
        main: "#10b981", // Emerald 500
        light: "#34d399",
        dark: "#059669",
      },
      warning: {
        main: "#f59e0b", // Amber 500
        light: "#fbbf24",
        dark: "#d97706",
      },
      error: {
        main: "#f43f5e", // Rose 500
        light: "#fb7185",
        dark: "#e11d48",
      },
      background: isLight
        ? { default: "#f8fafc", paper: "#ffffff" }
        : { default: "#000000", paper: "#0a0a0a" },
      text: isLight
        ? { primary: "#0f172a", secondary: "#64748b" }
        : { primary: "#ededed", secondary: "#a1a1a1" },
      divider: isLight ? "#e2e8f0" : "#1c1c1c",
    },
    typography: {
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
      ].join(","),
      fontSize: 14.25,
      htmlFontSize: 16,
      h4: {
        fontWeight: 700,
        letterSpacing: "-0.025em",
        color: isLight ? "#0f172a" : "#ededed",
      },
      h5: {
        fontWeight: 650,
        letterSpacing: "-0.015em",
        color: isLight ? "#0f172a" : "#ededed",
      },
      h6: {
        fontWeight: 600,
        letterSpacing: "-0.01em",
        color: isLight ? "#0f172a" : "#ededed",
      },
      subtitle1: {
        color: isLight ? "#64748b" : "#a1a1a1",
      },
      subtitle2: {
        fontWeight: 600,
        letterSpacing: "0.01em",
      },
      body2: {
        letterSpacing: "0.005em",
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
        letterSpacing: "0.01em",
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: "8px 18px",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 2px 6px -1px rgba(79, 70, 229, 0.2)",
            },
          },
          contained: {
            background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${isLight ? "#e2e8f0" : "#1c1c1c"}`,
            borderRadius: 14,
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            border: `1px solid ${isLight ? "#e2e8f0" : "#1c1c1c"}`,
            borderRadius: 14,
            boxShadow: isLight
              ? "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)"
              : "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)",
            transition: "all 0.2s ease-in-out",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isLight ? "#f1f5f9" : "#1c1c1c",
            padding: "12px 16px",
          },
          head: {
            fontWeight: 600,
            color: isLight ? "#475569" : "#b5b5b5",
            backgroundColor: isLight ? "#f8fafc" : "#0a0a0a",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
    },
  });
}

export const theme = buildTheme("light");
