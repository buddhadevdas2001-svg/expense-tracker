import { createTheme, alpha } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#4F46E5" : "#818CF8", 
        light: "#6366F1",
        dark: "#4338CA",
        contrastText: "#ffffff",
      },
      secondary: {
        main: mode === "light" ? "#0D9488" : "#2DD4BF", 
        light: "#14B8A6",
        dark: "#0F766E",
        contrastText: "#ffffff",
      },
      background: {
        default: mode === "light" ? "#F9FAFB" : "#0F172A", 
        paper: mode === "light" ? "#ffffff" : "#1E293B", 
      },
      text: {
        primary: mode === "light" ? "#111827" : "#F8FAFC",
        secondary: mode === "light" ? "#6B7280" : "#94A3B8",
      },
      error: {
        main: "#EF4444",
      },
      success: {
        main: "#10B981",
      },
      warning: {
        main: "#F59E0B",
      },
      info: {
        main: "#3B82F6",
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "8px 16px",
            boxShadow: "none",
            "&:hover": {
              boxShadow:
                mode === "light"
                  ? "0px 4px 12px rgba(0,0,0,0.1)"
                  : "0px 4px 12px rgba(255,255,255,0.05)",
            },
          },
          containedPrimary: {
            background:
              mode === "light"
                ? "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)"
                : "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow:
              mode === "light"
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
            border: `1px solid ${mode === "light" ? "#E5E7EB" : "#334155"}`,
            borderRadius: 16,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${mode === "light" ? "#E5E7EB" : "#334155"}`,
          },
          head: {
            fontWeight: 600,
            backgroundColor:
              mode === "light" ? alpha("#F3F4F6", 0.5) : alpha("#1E293B", 0.5),
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });