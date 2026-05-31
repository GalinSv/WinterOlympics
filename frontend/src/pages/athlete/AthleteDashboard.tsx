import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { Link } from "react-router-dom";

import {
    getCurrentAthlete,
    updateMyProfile,
} from "../../services/athleteService";
import { getAllCompetitions } from "../../services/competitionService";
import { registerForCompetition } from "../../services/registrationService";
import { notify } from "../../utils/notify";

import type { Athlete, Competition, Country, Gender } from "../../types/api";
import { COUNTRIES } from "../../types/api";

function AthleteDashboard() {
    const [athlete, setAthlete] = useState<Athlete | null>(null);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [selectedKey, setSelectedKey] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState<Athlete | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        Promise.all([getCurrentAthlete(), getAllCompetitions()])
            .then(([me, all]) => {
                setAthlete(me);
                setCompetitions(all);
                if (all[0]) setSelectedKey(`${all[0].sport}:${all[0].id}`);
            })
            .catch(() => setError("Could not load athlete profile."))
            .finally(() => setLoading(false));
    }, []);

    async function handleRegister() {
        if (!athlete?.id || !selectedKey) return;
        const [, id] = selectedKey.split(":");
        setBusy(true);
        try {
            await registerForCompetition(athlete.id, Number(id));
            notify.success("You are registered.");
        } catch (e) {
            notify.error(
                e,
                "Could not register. Check gender and minimum-age requirements."
            );
        } finally {
            setBusy(false);
        }
    }

    function openEdit() {
        if (!athlete) return;
        setEditForm({ ...athlete });
        setEditOpen(true);
    }

    async function handleSaveProfile() {
        if (!editForm) return;
        setSavingEdit(true);
        try {
            const updated = await updateMyProfile(editForm);
            setAthlete(updated);
            notify.success("Profile updated.");
            setEditOpen(false);
        } catch (e) {
            notify.error(e, "Could not update profile.");
        } finally {
            setSavingEdit(false);
        }
    }

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Typography
                component="h1"
                variant="h4"
                sx={{ mb: 3, fontWeight: 700 }}
            >
                Athlete Dashboard
            </Typography>

            <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}

                {athlete && (
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6">{athlete.name}</Typography>
                            <Typography color="text.secondary">
                                {athlete.country} · {athlete.gender} ·{" "}
                                {athlete.birthDate}
                            </Typography>
                            <Typography
                                color="text.secondary"
                                sx={{ mt: 1 }}
                            >
                                {athlete.email}
                            </Typography>
                            <Button
                                size="small"
                                onClick={openEdit}
                                sx={{ mt: 1 }}
                            >
                                Edit my profile
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Register for a competition
                        </Typography>
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                            sx={{ alignItems: { md: "center" } }}
                        >
                            <FormControl sx={{ minWidth: 320 }}>
                                <InputLabel id="comp-label">
                                    Competition
                                </InputLabel>
                                <Select
                                    labelId="comp-label"
                                    label="Competition"
                                    value={selectedKey}
                                    onChange={(e) =>
                                        setSelectedKey(e.target.value)
                                    }
                                >
                                    {competitions.map((c) => (
                                        <MenuItem
                                            key={`${c.sport}-${c.id}`}
                                            value={`${c.sport}:${c.id}`}
                                        >
                                            {c.name} ({c.sport}) — {c.gender},
                                            min age {c.minimumAge}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                disabled={busy || !selectedKey}
                                onClick={handleRegister}
                            >
                                Register
                            </Button>
                            <Button
                                component={Link}
                                to="/athlete/registrations"
                            >
                                My registrations
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>

            <Dialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Edit my profile</DialogTitle>
                <DialogContent>
                    {editForm && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                label="Full name"
                                value={editForm.name}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, name: e.target.value })
                                }
                                fullWidth
                            />
                            <TextField
                                label="Email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, email: e.target.value })
                                }
                                fullWidth
                            />
                            <TextField
                                label="Phone number"
                                value={editForm.phoneNumber}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        phoneNumber: e.target.value,
                                    })
                                }
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel id="me-country">Country</InputLabel>
                                <Select
                                    labelId="me-country"
                                    label="Country"
                                    value={editForm.country}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            country: e.target.value as Country,
                                        })
                                    }
                                >
                                    {COUNTRIES.map((c) => (
                                        <MenuItem key={c} value={c}>
                                            {c.replace(/_/g, " ")}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel id="me-gender">Gender</InputLabel>
                                <Select
                                    labelId="me-gender"
                                    label="Gender"
                                    value={editForm.gender}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            gender: e.target.value as Gender,
                                        })
                                    }
                                >
                                    <MenuItem value="MALE">Men</MenuItem>
                                    <MenuItem value="FEMALE">Women</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Birth date"
                                type="date"
                                value={editForm.birthDate}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        birthDate: e.target.value,
                                    })
                                }
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    htmlInput: {
                                        max: new Date()
                                            .toISOString()
                                            .slice(0, 10),
                                    },
                                }}
                                fullWidth
                            />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveProfile}
                        disabled={savingEdit || !editForm}
                    >
                        {savingEdit ? "Saving..." : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AthleteDashboard;
