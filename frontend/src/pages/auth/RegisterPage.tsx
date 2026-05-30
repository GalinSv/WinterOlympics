import { useState } from "react";

import axios from "axios";

import {
    Alert,
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { Link } from "react-router-dom";

import { registerAthleteAccount } from "../../services/authService";

import type {
    Country,
    Gender,
    RegisterRequest,
} from "../../types/api";
import { COUNTRIES } from "../../types/api";

const initialRequest: RegisterRequest = {
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    phoneNumber: "",
    country: "" as unknown as Country,
    gender: "MALE",
    birthDate: "",
};

function RegisterPage() {

    const [request, setRequest] =
        useState<RegisterRequest>(initialRequest);

    const [successMessage, setSuccessMessage] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");

    function updateField<Field extends keyof RegisterRequest>(
        field: Field,
        value: RegisterRequest[Field]
    ) {
        setRequest((currentRequest) => ({
            ...currentRequest,
            [field]: value,
        }));
    }

    function validateForm() {
        if (
            !request.username ||
            !request.password ||
            !request.confirmPassword ||
            !request.name ||
            !request.email ||
            !request.phoneNumber ||
            !request.country ||
            !request.birthDate
        ) {
            return "All fields are required.";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
            return "Enter a valid email address.";
        }

        if (request.password.length < 6) {
            return "Password must be at least 6 characters.";
        }

        if (request.password !== request.confirmPassword) {
            return "Passwords do not match.";
        }

        return "";
    }

    async function handleSubmit() {
        const validationError =
            validateForm();

        if (validationError) {
            setSuccessMessage("");
            setErrorMessage(validationError);
            return;
        }

        try {
            setSuccessMessage("");
            setErrorMessage("");

            await registerAthleteAccount(request);

            setRequest(initialRequest);
            setSuccessMessage(
                "Account created successfully. You can now sign in."
            );
        } catch (error) {
            console.error(error);

            if (axios.isAxiosError(error)) {
                const responseMessage =
                    typeof error.response?.data === "string"
                        ? error.response.data
                        : error.response?.data?.message;

                setErrorMessage(
                    responseMessage ||
                    "Could not create account. Check the fields and try again."
                );
                return;
            }

            setErrorMessage(
                "Could not create account. Check the fields and try again."
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
                    maxWidth: 560,
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
                            Athlete Registration
                        </Typography>

                        <Typography color="text.secondary">
                            Create your account and athlete profile.
                        </Typography>
                    </Box>

                    {successMessage && (
                        <Alert severity="success">
                            {successMessage}
                        </Alert>
                    )}

                    {errorMessage && (
                        <Alert severity="error">
                            {errorMessage}
                        </Alert>
                    )}

                    <TextField
                        label="Username"
                        value={request.username}
                        onChange={(event) =>
                            updateField("username", event.target.value)
                        }
                        fullWidth
                    />

                    <TextField
                        label="Password"
                        type="password"
                        value={request.password}
                        onChange={(event) =>
                            updateField("password", event.target.value)
                        }
                        fullWidth
                    />

                    <TextField
                        label="Confirm password"
                        type="password"
                        value={request.confirmPassword}
                        onChange={(event) =>
                            updateField("confirmPassword", event.target.value)
                        }
                        fullWidth
                    />

                    <TextField
                        label="Full name"
                        value={request.name}
                        onChange={(event) =>
                            updateField("name", event.target.value)
                        }
                        fullWidth
                    />

                    <TextField
                        label="Email"
                        type="email"
                        value={request.email}
                        onChange={(event) =>
                            updateField("email", event.target.value)
                        }
                        fullWidth
                    />

                    <TextField
                        label="Phone number"
                        value={request.phoneNumber}
                        onChange={(event) =>
                            updateField("phoneNumber", event.target.value)
                        }
                        fullWidth
                    />

                    <FormControl fullWidth>
                        <InputLabel id="country-label">Country</InputLabel>
                        <Select
                            labelId="country-label"
                            label="Country"
                            value={request.country ?? ""}
                            onChange={(event) =>
                                updateField(
                                    "country",
                                    event.target.value as Country
                                )
                            }
                        >
                            {COUNTRIES.map((country) => (
                                <MenuItem key={country} value={country}>
                                    {country.replace(/_/g, " ")}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="gender-label">
                            Gender
                        </InputLabel>

                        <Select
                            labelId="gender-label"
                            label="Gender"
                            value={request.gender}
                            onChange={(event) =>
                                updateField(
                                    "gender",
                                    event.target.value as Gender
                                )
                            }
                        >
                            <MenuItem value="MALE">
                                Men
                            </MenuItem>
                            <MenuItem value="FEMALE">
                                Women
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Birth date"
                        type="date"
                        value={request.birthDate}
                        onChange={(event) =>
                            updateField("birthDate", event.target.value)
                        }
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        fullWidth
                    />

                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        size="large"
                    >
                        Register
                    </Button>

                    <Button
                        component={Link}
                        to="/login"
                    >
                        Back to login
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}

export default RegisterPage;
