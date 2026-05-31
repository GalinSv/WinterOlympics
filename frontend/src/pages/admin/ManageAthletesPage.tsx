import { useEffect, useMemo, useState } from "react";

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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import {
    createAthlete,
    deleteAthlete,
    getAllAthletes,
    updateAthlete,
} from "../../services/athleteService";
import { notify } from "../../utils/notify";

import type { Athlete, Country, Gender } from "../../types/api";
import { COUNTRIES } from "../../types/api";

const EMPTY_ATHLETE: Athlete = {
    name: "",
    email: "",
    phoneNumber: "",
    country: "BULGARIA" as Country,
    gender: "MALE",
    birthDate: "",
};

function ManageAthletesPage() {
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Athlete | null>(null);
    const [form, setForm] = useState<Athlete>(EMPTY_ATHLETE);
    const [saving, setSaving] = useState(false);
    const safeAthletes = useMemo(
        () => (Array.isArray(athletes) ? athletes : []),
        [athletes]
    );

    function load() {
        setLoading(true);
        getAllAthletes()
            .then((list) => setAthletes(Array.isArray(list) ? list : []))
            .catch(() => setError("Could not load athletes."))
            .finally(() => setLoading(false));
    }

    useEffect(load, []);

    function openCreate() {
        setEditing(null);
        setForm(EMPTY_ATHLETE);
        setDialogOpen(true);
    }

    function openEdit(a: Athlete) {
        setEditing(a);
        setForm({ ...a });
        setDialogOpen(true);
    }

    async function handleSave() {
        setSaving(true);
        try {
            if (editing?.id) {
                await updateAthlete(editing.id, form);
                notify.success("Athlete updated.");
            } else {
                await createAthlete(form);
                notify.success("Athlete created.");
            }
            setDialogOpen(false);
            load();
        } catch (e) {
            notify.error(e, "Could not save athlete.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(athlete: Athlete) {
        if (!athlete.id) return;
        if (!window.confirm(`Delete athlete "${athlete.name}"?`)) return;
        try {
            await deleteAthlete(athlete.id);
            notify.success("Athlete deleted.");
            load();
        } catch (e) {
            notify.error(e, "Could not delete athlete.");
        }
    }

    return (
        <Box>
            <Stack
                direction="row"
                sx={{ mb: 3, alignItems: "center", justifyContent: "space-between" }}
            >
                <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
                    Manage Athletes
                </Typography>
                <Button variant="contained" onClick={openCreate}>
                    New athlete
                </Button>
            </Stack>

            <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}

                <Card variant="outlined">
                    <CardContent>
                        {loading ? (
                            <CircularProgress />
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Country</TableCell>
                                            <TableCell>Gender</TableCell>
                                            <TableCell>Birth date</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {safeAthletes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7}>
                                                    No athletes registered.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            safeAthletes.map((a) => (
                                                <TableRow key={a.id}>
                                                    <TableCell>{a.id}</TableCell>
                                                    <TableCell>{a.name}</TableCell>
                                                    <TableCell>{a.country}</TableCell>
                                                    <TableCell>{a.gender}</TableCell>
                                                    <TableCell>{a.birthDate}</TableCell>
                                                    <TableCell>{a.email}</TableCell>
                                                    <TableCell align="right">
                                                        <Button
                                                            size="small"
                                                            onClick={() => openEdit(a)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDelete(a)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>
            </Stack>

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>{editing ? "Edit athlete" : "New athlete"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Full name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Phone number"
                            value={form.phoneNumber}
                            onChange={(e) =>
                                setForm({ ...form, phoneNumber: e.target.value })
                            }
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel id="a-country">Country</InputLabel>
                            <Select
                                labelId="a-country"
                                label="Country"
                                value={form.country}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
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
                            <InputLabel id="a-gender">Gender</InputLabel>
                            <Select
                                labelId="a-gender"
                                label="Gender"
                                value={form.gender}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
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
                            value={form.birthDate}
                            onChange={(e) =>
                                setForm({ ...form, birthDate: e.target.value })
                            }
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: {
                                    max: new Date().toISOString().slice(0, 10),
                                },
                            }}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={
                            saving ||
                            !form.name ||
                            !form.email ||
                            !form.phoneNumber ||
                            !form.birthDate
                        }
                    >
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ManageAthletesPage;
