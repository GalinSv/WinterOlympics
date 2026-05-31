import { useState } from "react";

import {
    Alert,
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import { login } from "../../services/authService";
import { notify } from "../../utils/notify";

function LoginPage() {

    const navigate = useNavigate();

    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");

    async function handleLogin() {

        try {
            setErrorMessage("");

            await login(username, password);

            notify.success("Logged in successfully.");
            navigate("/");

        } catch (error) {

            notify.error(error, "Login failed. Check username and password.");

            setErrorMessage(
                "Login failed. Check username and password."
            );
        }
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                bgcolor: "grey.50",
                p: 2,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    p: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                }}
            >
                <Stack spacing={2.5}>
                    <Box>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{ fontWeight: 700 }}
                        >
                            Login
                        </Typography>

                        <Typography color="text.secondary">
                            Sign in to your account.
                        </Typography>
                    </Box>

                    {errorMessage && (
                        <Alert severity="error">
                            {errorMessage}
                        </Alert>
                    )}

                    <TextField
                        label="Username"
                        value={username}
                        onChange={(event) =>
                            setUsername(event.target.value)
                        }
                        fullWidth
                    />

                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        fullWidth
                    />

                    <Button
                        onClick={handleLogin}
                        variant="contained"
                        size="large"
                        disabled={!username || !password}
                    >
                        Login
                    </Button>

                    <Button
                        component={Link}
                        to="/register"
                    >
                        Register athlete account
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}

export default LoginPage;
