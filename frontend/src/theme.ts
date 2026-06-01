import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#1565c0", dark: "#0d47a1", light: "#5e92f3" },
        secondary: { main: "#00838f" },
        success: { main: "#2e7d32" },
        background: { default: "#eef2f7", paper: "#ffffff" },
        text: { primary: "#0f172a", secondary: "#52617a" },
        divider: "#e2e8f0",
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily:
            '"Inter","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
        h1: { fontWeight: 800, letterSpacing: "-1px" },
        h2: { fontWeight: 800, letterSpacing: "-0.5px" },
        h3: { fontWeight: 800, letterSpacing: "-0.5px" },
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
                    transition:
                        "box-shadow .2s ease, transform .2s ease, border-color .2s ease",
                },
            },
        },
        MuiCardActionArea: {
            styleOverrides: {
                root: {
                    "&:hover": { backgroundColor: "rgba(21,101,192,0.03)" },
                },
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: ({ ownerState }) => ({
                    borderRadius: 10,
                    ...(ownerState.variant === "contained" &&
                        ownerState.color === "primary" && {
                            boxShadow: "0 2px 8px rgba(21,101,192,0.25)",
                            "&:hover": {
                                boxShadow: "0 4px 14px rgba(21,101,192,0.35)",
                            },
                        }),
                }),
            },
        },
        MuiChip: {
            styleOverrides: { root: { fontWeight: 600 } },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    "& th": {
                        fontWeight: 700,
                        color: "#334155",
                        backgroundColor: "#f8fafc",
                        whiteSpace: "nowrap",
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    transition: "background-color .15s ease",
                    "&:hover": { backgroundColor: "#f8fafc" },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: { borderColor: "#e2e8f0" },
                head: { borderBottom: "2px solid #e2e8f0" },
            },
        },
        MuiPaper: {
            styleOverrides: { rounded: { borderRadius: 14 } },
        },
        MuiAppBar: {
            styleOverrides: {
                root: { backdropFilter: "saturate(180%) blur(8px)" },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: { root: { borderRadius: 10 } },
        },
        MuiToggleButton: {
            styleOverrides: {
                root: { textTransform: "none", fontWeight: 600 },
            },
        },
    },
});

export default theme;
