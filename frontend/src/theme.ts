import { createTheme } from "@mui/material/styles";

// Modest "winter" theme: cool blues, soft surfaces, rounded cards.
const theme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#1565c0", dark: "#0d47a1", light: "#5e92f3" },
        secondary: { main: "#00838f" },
        success: { main: "#2e7d32" },
        background: { default: "#f1f5f9", paper: "#ffffff" },
        text: { primary: "#0f172a", secondary: "#475569" },
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily:
            '"Inter","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
        h1: { fontWeight: 800 },
        h2: { fontWeight: 800 },
        h4: { fontWeight: 800, letterSpacing: "-0.5px" },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
        button: { fontWeight: 600, textTransform: "none" },
    },
    components: {
        MuiCard: {
            defaultProps: { variant: "outlined" },
            styleOverrides: {
                root: {
                    borderColor: "#e2e8f0",
                    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                },
            },
        },
        MuiButton: {
            styleOverrides: { root: { borderRadius: 10 } },
        },
        MuiTableHead: {
            styleOverrides: {
                root: { "& th": { fontWeight: 700, color: "#334155" } },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: { backdropFilter: "saturate(180%) blur(6px)" },
            },
        },
    },
});

export default theme;
