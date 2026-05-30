import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";

import { Link } from "react-router-dom";

import { getAllCompetitions } from "../../services/competitionService";
import {
    generateBiathlonDemoResults,
    generateSlalomDemoResults,
} from "../../services/resultService";

import type { Competition } from "../../types/api";

function AdminDashboard() {

    const [competitions, setCompetitions] =
        useState<Competition[]>([]);

    const [selectedKey, setSelectedKey] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [generating, setGenerating] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    useEffect(() => {
        getAllCompetitions()
            .then((loadedCompetitions) => {
                setCompetitions(loadedCompetitions);

                const firstCompetition =
                    loadedCompetitions[0];

                if (firstCompetition) {
                    setSelectedKey(
                        `${firstCompetition.sport}:${firstCompetition.id}`
                    );
                }
            })
            .catch(() =>
                setError("Could not load competitions.")
            )
            .finally(() => setLoading(false));
    }, []);

    const selectedCompetition =
        useMemo(() => {
            const [sport, id] =
                selectedKey.split(":");

            return competitions.find((competition) =>
                competition.sport === sport &&
                competition.id === Number(id)
            );
        }, [competitions, selectedKey]);

    async function handleGenerateResults() {
        if (!selectedCompetition) {
            return;
        }

        setGenerating(true);
        setMessage("");
        setError("");

        try {
            if (selectedCompetition.sport === "slalom") {
                await generateSlalomDemoResults(
                    selectedCompetition.id
                );
            } else {
                await generateBiathlonDemoResults(
                    selectedCompetition.id
                );
            }

            setMessage(
                `Demo results generated for ${selectedCompetition.name}.`
            );
        } catch (requestError) {
            console.error(requestError);
            setError(
                "Could not generate demo results. Make sure athletes are registered for this competition."
            );
        } finally {
            setGenerating(false);
        }
    }

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Typography
                component="h1"
                variant="h4"
                sx={{ mb: 3, fontWeight: 700 }}
            >
                Admin Dashboard
            </Typography>

            <Stack spacing={3}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                            Admin tools
                        </Typography>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            sx={{ flexWrap: "wrap" }}
                        >
                            <Button
                                component={Link}
                                to="/admin/competitions"
                                variant="contained"
                            >
                                Manage competitions
                            </Button>
                            <Button
                                component={Link}
                                to="/admin/athletes"
                                variant="contained"
                            >
                                Manage athletes
                            </Button>
                            <Button
                                component={Link}
                                to="/admin/results"
                                variant="contained"
                            >
                                Enter results
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {message && (
                    <Alert severity="success">
                        {message}
                    </Alert>
                )}

                {error && (
                    <Alert severity="error">
                        {error}
                    </Alert>
                )}

                <Card variant="outlined">
                    <CardContent>
                        <Stack spacing={2.5}>
                            <Box>
                                <Typography
                                    component="h2"
                                    variant="h6"
                                >
                                    Demo Result Generation
                                </Typography>

                                <Typography color="text.secondary">
                                    Generate realistic slalom or biathlon
                                    results for registered athletes.
                                </Typography>
                            </Box>

                            {competitions.length === 0 ? (
                                <Alert severity="info">
                                    Create competitions before generating
                                    results.
                                </Alert>
                            ) : (
                                <Stack
                                    direction={{
                                        xs: "column",
                                        md: "row",
                                    }}
                                    spacing={2}
                                    sx={{
                                        alignItems: {
                                            xs: "stretch",
                                            md: "center",
                                        },
                                    }}
                                >
                                    <FormControl sx={{ minWidth: 320 }}>
                                        <InputLabel id="admin-competition-label">
                                            Competition
                                        </InputLabel>

                                        <Select
                                            labelId="admin-competition-label"
                                            label="Competition"
                                            value={selectedKey}
                                            onChange={(event) =>
                                                setSelectedKey(
                                                    event.target.value
                                                )
                                            }
                                        >
                                            {competitions.map(
                                                (competition) => (
                                                    <MenuItem
                                                        key={`${competition.sport}-${competition.id}`}
                                                        value={`${competition.sport}:${competition.id}`}
                                                    >
                                                        {competition.name} (
                                                        {competition.sport ===
                                                        "slalom"
                                                            ? "Slalom"
                                                            : "Biathlon"}
                                                        )
                                                    </MenuItem>
                                                )
                                            )}
                                        </Select>
                                    </FormControl>

                                    <Button
                                        onClick={handleGenerateResults}
                                        variant="contained"
                                        disabled={
                                            !selectedCompetition ||
                                            generating
                                        }
                                    >
                                        {generating
                                            ? "Generating..."
                                            : "Generate demo results"}
                                    </Button>

                                    <Button
                                        component={Link}
                                        to="/rankings"
                                    >
                                        View rankings
                                    </Button>
                                </Stack>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
}

export default AdminDashboard;
