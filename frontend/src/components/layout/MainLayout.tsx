import { Outlet, Link } from "react-router-dom";

import {
    AppBar,
    Box,
    Button,
    Container,
    Toolbar,
    Typography,
} from "@mui/material";

import { logout } from "../../services/authService";
import {
    hasRole,
    isAuthenticated,
} from "../../utils/jwt";

function MainLayout() {
    const authenticated =
        isAuthenticated();

    const isAdmin =
        hasRole("ROLE_ADMIN");

    const isAthlete =
        hasRole("ROLE_ATHLETE");

    function handleLogout() {
        logout();
    }

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
            <AppBar
                position="static"
                elevation={0}
                color="inherit"
                sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar
                        disableGutters
                        sx={{
                            gap: 1,
                            minHeight: 68,
                        }}
                    >
                        <Typography
                            component={Link}
                            to="/"
                            variant="h6"
                            sx={{
                                mr: 2,
                                color: "text.primary",
                                fontWeight: 700,
                                textDecoration: "none",
                            }}
                        >
                            Winter Olympics
                        </Typography>

                        <Box
                            component="nav"
                            sx={{
                                display: "flex",
                                flexGrow: 1,
                                gap: 0.5,
                                flexWrap: "wrap",
                            }}
                        >
                            <Button
                                component={Link}
                                to="/competitions/slalom"
                                color="inherit"
                            >
                                Slalom
                            </Button>

                            <Button
                                component={Link}
                                to="/competitions/biathlon"
                                color="inherit"
                            >
                                Biathlon
                            </Button>

                            <Button
                                component={Link}
                                to="/rankings"
                                color="inherit"
                            >
                                Rankings
                            </Button>

                            <Button
                                component={Link}
                                to="/statistics"
                                color="inherit"
                            >
                                Statistics
                            </Button>

                            {authenticated && isAdmin && (
                                <Button
                                    component={Link}
                                    to="/admin"
                                    color="inherit"
                                >
                                    Admin
                                </Button>
                            )}

                            {authenticated && isAthlete && (
                                <Button
                                    component={Link}
                                    to="/athlete"
                                    color="inherit"
                                >
                                    My account
                                </Button>
                            )}
                        </Box>

                        {authenticated ? (
                            <Button
                                onClick={handleLogout}
                                variant="outlined"
                            >
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

            <Container
                maxWidth="lg"
                sx={{ py: 4 }}
            >
                <Outlet />
            </Container>
        </Box>
    );
}

export default MainLayout;
