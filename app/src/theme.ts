import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
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
    background: {
      default: "#f8fafc", // Slate 50
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a", // Slate 900
      secondary: "#64748b", // Slate 500
    },
    divider: "#e2e8f0", // Slate 200
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
      color: "#0f172a",
    },
    h5: {
      fontWeight: 650,
      letterSpacing: "-0.015em",
      color: "#0f172a",
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
      color: "#0f172a",
    },
    subtitle1: {
      color: "#64748b",
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
          border: "1px solid #e2e8f0",
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
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
          transition: "all 0.2s ease-in-out",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#f1f5f9",
          padding: "12px 16px",
        },
        head: {
          fontWeight: 600,
          color: "#475569",
          backgroundColor: "#f8fafc",
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
