import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import { register } from "../../services/authService";
import { isAuthenticated } from "../../utils/jwt";

function RegisterPage() {
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated()) {
            navigate("/", { replace: true });
            return;
        }
        register();
    }, [navigate]);

    return (
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
            <Stack spacing={2} sx={{ alignItems: "center" }}>
                <CircularProgress />
                <Typography color="text.secondary">
                    Redirecting to registration…
                </Typography>
            </Stack>
        </Box>
    );
}

export default RegisterPage;
