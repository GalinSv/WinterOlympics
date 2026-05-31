import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import { login } from "../../services/authService";
import { isAuthenticated } from "../../utils/jwt";

function LoginPage() {
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated()) {
            navigate("/", { replace: true });
            return;
        }
        login();
    }, [navigate]);

    return (
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
            <Stack spacing={2} sx={{ alignItems: "center" }}>
                <CircularProgress />
                <Typography color="text.secondary">
                    Redirecting to sign in…
                </Typography>
            </Stack>
        </Box>
    );
}

export default LoginPage;
