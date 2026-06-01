import { Outlet, Link, useLocation } from "react-router-dom";

import {
    AppBar,
    Box,
    Button,
    Container,
    Toolbar,
    Typography,
} from "@mui/material";
import AcUnitIcon from "@mui/icons-material/AcUnit";

import { logout } from "../../services/authService";
import { hasRole, isAuthenticated } from "../../utils/jwt";

function MainLayout() {
    const location = useLocation();
    const authenticated = isAuthenticated();
    const isAdmin = hasRole("ROLE_ADMIN");
    const isAthlete = hasRole("ROLE_ATHLETE");

    const navItems = [
        { to: "/competitions/slalom", label: "Slalom" },
        { to: "/competitions/biathlon", label: "Biathlon" },
        { to: "/rankings", label: "Rankings" },
        { to: "/statistics", label: "Statistics" },
    ];
    if (authenticated && isAdmin) navItems.push({ to: "/admin", label: "Admin" });
    if (authenticated && isAthlete)
        navItems.push({ to: "/athlete", label: "My account" });

    function isActive(to: string) {
        return (
            location.pathname === to ||
            location.pathname.startsWith(to + "/")
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <AppBar
                position="sticky"
                elevation={0}
                color="inherit"
                sx={{
                    top: 0,
                    bgcolor: "rgba(255,255,255,0.8)",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{ gap: 1, minHeight: 68 }}>
                        <Box
                            component={Link}
                            to="/"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mr: 2,
                                textDecoration: "none",
                                color: "text.primary",
                            }}
                        >
                            <AcUnitIcon sx={{ color: "primary.main" }} />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Winter Olympics
                            </Typography>
                        </Box>

                        <Box
                            component="nav"
                            sx={{
                                display: "flex",
                                flexGrow: 1,
                                gap: 0.5,
                                flexWrap: "wrap",
                            }}
                        >
                            {navItems.map((item) => {
                                const active = isActive(item.to);
                                return (
                                    <Button
                                        key={item.to}
                                        component={Link}
                                        to={item.to}
                                        sx={{
                                            color: active
                                                ? "primary.main"
                                                : "text.secondary",
                                            fontWeight: active ? 700 : 600,
                                            bgcolor: active
                                                ? "rgba(21,101,192,0.1)"
                                                : "transparent",
                                            "&:hover": {
                                                bgcolor: active
                                                    ? "rgba(21,101,192,0.16)"
                                                    : "action.hover",
                                            },
                                        }}
                                    >
                                        {item.label}
                                    </Button>
                                );
                            })}
                        </Box>

                        {authenticated ? (
                            <Button onClick={() => logout()} variant="outlined">
                                Logout
                            </Button>
                        ) : (
                            <Button
                                component={Link}
                                to="/login"
                                variant="contained"
                            >
                                Login
                            </Button>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Outlet />
            </Container>
        </Box>
    );
}

export default MainLayout;
