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

import {
    getAllCompetitions,
    runBiathlonDemo,
    runSlalomDemo,
} from "../../services/competitionService";
import { notify } from "../../utils/notify";

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

        if (selectedCompetition.status === "FINISHED") {
            notify.info("This competition is already finalized.");
            return;
        }

        setGenerating(true);

        try {
            if (selectedCompetition.sport === "slalom") {
                await runSlalomDemo(selectedCompetition.id);
            } else {
                await runBiathlonDemo(selectedCompetition.id);
            }

            notify.success(
                `Demo complete: "${selectedCompetition.name}" was filled with athletes, scored, ranked, finalized and medals were awarded.`
            );

            const refreshed = await getAllCompetitions();
            setCompetitions(refreshed);
        } catch (requestError) {
            notify.error(
                requestError,
                "Could not generate demo. Make sure enough eligible athletes exist for this competition's gender and minimum age."
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
                                    One click registers eligible athletes,
                                    generates realistic results, calculates the
                                    ranking, finalizes the competition and
                                    awards medals.
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
