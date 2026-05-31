import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
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
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import {
    assignBiathlonMedals,
    assignSlalomMedals,
    createBiathlonCompetition,
    createSlalomCompetition,
    deleteBiathlonCompetition,
    deleteSlalomCompetition,
    finalizeBiathlonCompetition,
    finalizeSlalomCompetition,
    getAllCompetitions,
    updateBiathlonCompetition,
    updateSlalomCompetition,
} from "../../services/competitionService";
import { getAllAthletes } from "../../services/athleteService";
import {
    cancelRegistration,
    getRegistrationsByCompetition,
    registerForCompetition,
} from "../../services/registrationService";
import { notify } from "../../utils/notify";

import type {
    Athlete,
    Competition,
    Gender,
    Registration,
    SportType,
} from "../../types/api";

type FormState = {
    sport: SportType;
    name: string;
    date: string;
    gender: Gender;
    minimumAge: number;
    secondRunQualifiedCount: number;
    lapCount: number;
    shootingRounds: number;
    penaltySeconds: number;
};

const EMPTY_FORM: FormState = {
    sport: "slalom",
    name: "",
    date: "",
    gender: "MALE",
    minimumAge: 18,
    secondRunQualifiedCount: 30,
    lapCount: 4,
    shootingRounds: 2,
    penaltySeconds: 60,
};

function CreateCompetitionPage() {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Competition | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"DATE_DESC" | "DATE_ASC">(
        "DATE_DESC"
    );
    const [finalizingId, setFinalizingId] = useState<number | null>(null);

    const [allAthletes, setAllAthletes] = useState<Athlete[]>([]);
    const [participantsComp, setParticipantsComp] =
        useState<Competition | null>(null);
    const [participants, setParticipants] = useState<Registration[]>([]);
    const [athleteToAdd, setAthleteToAdd] = useState<Athlete | null>(null);
    const [participantsBusy, setParticipantsBusy] = useState(false);

    const visibleCompetitions = useMemo(() => {
        let list = competitions;
        const q = search.trim().toLowerCase();
        if (q) list = list.filter((c) => c.name.toLowerCase().includes(q));
        return [...list].sort((a, b) =>
            sortOrder === "DATE_DESC"
                ? b.date.localeCompare(a.date)
                : a.date.localeCompare(b.date)
        );
    }, [competitions, search, sortOrder]);

    function load() {
        setLoading(true);
        getAllCompetitions()
            .then(setCompetitions)
            .catch(() => setError("Could not load competitions."))
            .finally(() => setLoading(false));
    }

    useEffect(load, []);

    useEffect(() => {
        getAllAthletes()
            .then((list) => setAllAthletes(Array.isArray(list) ? list : []))
            .catch(() => setAllAthletes([]));
    }, []);

    async function openParticipants(c: Competition) {
        setParticipantsComp(c);
        setAthleteToAdd(null);
        try {
            setParticipants(await getRegistrationsByCompetition(c.id));
        } catch (e) {
            notify.error(e, "Could not load participants.");
            setParticipants([]);
        }
    }

    const eligibleAthletes = useMemo(() => {
        if (!participantsComp) return [] as Athlete[];
        const registeredIds = new Set(participants.map((r) => r.athleteId));
        return allAthletes.filter(
            (a) =>
                a.id !== undefined &&
                !registeredIds.has(a.id) &&
                a.gender === participantsComp.gender
        );
    }, [allAthletes, participants, participantsComp]);

    async function handleAddParticipant() {
        if (!participantsComp || !athleteToAdd?.id) return;
        setParticipantsBusy(true);
        try {
            await registerForCompetition(athleteToAdd.id, participantsComp.id);
            notify.success(`${athleteToAdd.name} added.`);
            setAthleteToAdd(null);
            setParticipants(
                await getRegistrationsByCompetition(participantsComp.id)
            );
        } catch (e) {
            notify.error(
                e,
                "Could not add athlete. Check gender/age or duplicate registration."
            );
        } finally {
            setParticipantsBusy(false);
        }
    }

    async function handleRemoveParticipant(registrationId: number) {
        if (!participantsComp) return;
        setParticipantsBusy(true);
        try {
            await cancelRegistration(registrationId);
            notify.success("Participant removed.");
            setParticipants(
                await getRegistrationsByCompetition(participantsComp.id)
            );
        } catch (e) {
            notify.error(e, "Could not remove participant.");
        } finally {
            setParticipantsBusy(false);
        }
    }

    function openCreate() {
        setEditing(null);
        setForm(EMPTY_FORM);
        setDialogOpen(true);
    }

    function openEdit(c: Competition) {
        setEditing(c);
        if (c.sport === "slalom") {
            setForm({
                ...EMPTY_FORM,
                sport: "slalom",
                name: c.name,
                date: c.date,
                gender: c.gender,
                minimumAge: c.minimumAge,
                secondRunQualifiedCount: c.secondRunQualifiedCount,
            });
        } else {
            setForm({
                ...EMPTY_FORM,
                sport: "biathlon",
                name: c.name,
                date: c.date,
                gender: c.gender,
                minimumAge: c.minimumAge,
                lapCount: c.lapCount,
                shootingRounds: c.shootingRounds,
                penaltySeconds: c.penaltySeconds,
            });
        }
        setDialogOpen(true);
    }

    async function handleSave() {
        setSaving(true);
        try {
            if (form.sport === "slalom") {
                const payload = {
                    name: form.name,
                    date: form.date,
                    gender: form.gender,
                    minimumAge: Number(form.minimumAge),
                    secondRunQualifiedCount: Number(form.secondRunQualifiedCount),
                };
                if (editing && editing.sport === "slalom") {
                    await updateSlalomCompetition(editing.id, payload);
                } else {
                    await createSlalomCompetition(payload);
                }
            } else {
                const payload = {
                    name: form.name,
                    date: form.date,
                    gender: form.gender,
                    minimumAge: Number(form.minimumAge),
                    lapCount: Number(form.lapCount),
                    shootingRounds: Number(form.shootingRounds),
                    penaltySeconds: Number(form.penaltySeconds),
                };
                if (editing && editing.sport === "biathlon") {
                    await updateBiathlonCompetition(editing.id, payload);
                } else {
                    await createBiathlonCompetition(payload);
                }
            }
            notify.success(
                editing ? "Competition updated." : "Competition created."
            );
            setDialogOpen(false);
            load();
        } catch (e) {
            notify.error(e, "Could not save competition. Check fields and try again.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(c: Competition) {
        if (
            !window.confirm(
                `Delete "${c.name}"? This removes its registrations, results and medals.`
            )
        )
            return;
        try {
            if (c.sport === "slalom") {
                await deleteSlalomCompetition(c.id);
            } else {
                await deleteBiathlonCompetition(c.id);
            }
            notify.success("Competition deleted.");
            load();
        } catch (e) {
            notify.error(e, "Could not delete competition.");
        }
    }

    async function handleFinalize(c: Competition) {
        if (
            !window.confirm(
                `Finalize "${c.name}"? This will also assign medals automatically.`
            )
        )
            return;
        setFinalizingId(c.id);
        try {
            if (c.sport === "slalom") {
                await finalizeSlalomCompetition(c.id);
                await assignSlalomMedals(c.id);
            } else {
                await finalizeBiathlonCompetition(c.id);
                await assignBiathlonMedals(c.id);
            }
            notify.success(`"${c.name}" finalized and medals assigned.`);
            load();
        } catch (e) {
            notify.error(
                e,
                "Could not finalize competition. Make sure rankings are calculated first."
            );
        } finally {
            setFinalizingId(null);
        }
    }

    return (
        <Box>
            <Stack
                direction="row"
                sx={{ mb: 3, alignItems: "center", justifyContent: "space-between" }}
            >
                <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
                    Manage Competitions
                </Typography>
                <Button variant="contained" onClick={openCreate}>
                    New competition
                </Button>
            </Stack>

            <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}

                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    sx={{ alignItems: { md: "center" }, flexWrap: "wrap" }}
                >
                    <TextField
                        size="small"
                        label="Search by name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ minWidth: 240 }}
                    />
                    <ToggleButtonGroup
                        value={sortOrder}
                        exclusive
                        onChange={(_e: unknown, value: typeof sortOrder | null) => {
                            if (value) setSortOrder(value);
                        }}
                        size="small"
                    >
                        <ToggleButton value="DATE_DESC">Newest first</ToggleButton>
                        <ToggleButton value="DATE_ASC">Oldest first</ToggleButton>
                    </ToggleButtonGroup>
                </Stack>

                <Card variant="outlined">
                    <CardContent>
                        {loading ? (
                            <CircularProgress />
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Sport</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Gender</TableCell>
                                            <TableCell align="right">Min age</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {visibleCompetitions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7}>
                                                    No competitions match.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            visibleCompetitions.map((c) => (
                                                <TableRow key={`${c.sport}-${c.id}`}>
                                                    <TableCell>{c.name}</TableCell>
                                                    <TableCell>
                                                        {c.sport === "slalom"
                                                            ? "Slalom"
                                                            : "Biathlon"}
                                                    </TableCell>
                                                    <TableCell>{c.date}</TableCell>
                                                    <TableCell>{c.gender}</TableCell>
                                                    <TableCell align="right">
                                                        {c.minimumAge}
                                                    </TableCell>
                                                    <TableCell>
                                                        {c.status ?? "—"}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Button
                                                            size="small"
                                                            onClick={() => openEdit(c)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            onClick={() =>
                                                                openParticipants(c)
                                                            }
                                                        >
                                                            Participants
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            disabled={
                                                                finalizingId === c.id ||
                                                                c.status === "FINISHED"
                                                            }
                                                            onClick={() =>
                                                                handleFinalize(c)
                                                            }
                                                        >
                                                            {finalizingId === c.id
                                                                ? "Finalizing..."
                                                                : "Finalize"}
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDelete(c)}
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
                <DialogTitle>
                    {editing ? "Edit competition" : "New competition"}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <FormControl fullWidth disabled={Boolean(editing)}>
                            <InputLabel id="sport-label">Sport</InputLabel>
                            <Select
                                labelId="sport-label"
                                label="Sport"
                                value={form.sport}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        sport: e.target.value as SportType,
                                    })
                                }
                            >
                                <MenuItem value="slalom">Slalom</MenuItem>
                                <MenuItem value="biathlon">Biathlon</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Name"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            fullWidth
                        />
                        <TextField
                            label="Date"
                            type="date"
                            value={form.date}
                            onChange={(e) =>
                                setForm({ ...form, date: e.target.value })
                            }
                            slotProps={{ inputLabel: { shrink: true } }}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel id="gender-label">Gender</InputLabel>
                            <Select
                                labelId="gender-label"
                                label="Gender"
                                value={form.gender}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        gender: e.target.value as Gender,
                                    })
                                }
                            >
                                <MenuItem value="MALE">Male</MenuItem>
                                <MenuItem value="FEMALE">Female</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Minimum age"
                            type="number"
                            value={form.minimumAge}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    minimumAge: Number(e.target.value),
                                })
                            }
                            fullWidth
                        />

                        {form.sport === "slalom" ? (
                            <TextField
                                label="Second-run qualified count"
                                type="number"
                                value={form.secondRunQualifiedCount}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        secondRunQualifiedCount: Number(
                                            e.target.value
                                        ),
                                    })
                                }
                                fullWidth
                            />
                        ) : (
                            <>
                                <TextField
                                    label="Lap count"
                                    type="number"
                                    value={form.lapCount}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            lapCount: Number(e.target.value),
                                        })
                                    }
                                    fullWidth
                                />
                                <TextField
                                    label="Shooting rounds"
                                    type="number"
                                    value={form.shootingRounds}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            shootingRounds: Number(e.target.value),
                                        })
                                    }
                                    fullWidth
                                />
                                <TextField
                                    label="Penalty seconds per miss"
                                    type="number"
                                    value={form.penaltySeconds}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            penaltySeconds: Number(e.target.value),
                                        })
                                    }
                                    fullWidth
                                />
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving || !form.name || !form.date}
                    >
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(participantsComp)}
                onClose={() => setParticipantsComp(null)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Participants — {participantsComp?.name}
                </DialogTitle>
                <DialogContent>
                    {participantsComp && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {participantsComp.sport === "slalom"
                                    ? "Ski slalom"
                                    : "Biathlon"}{" "}
                                ·{" "}
                                {participantsComp.gender === "MALE"
                                    ? "Men"
                                    : "Women"}{" "}
                                · Min age {participantsComp.minimumAge}
                            </Typography>

                            {participantsComp.status === "FINISHED" ? (
                                <Alert severity="info">
                                    This competition is finalized; participants
                                    are locked.
                                </Alert>
                            ) : (
                                <Stack direction="row" spacing={1.5}>
                                    <Autocomplete
                                        sx={{ flex: 1 }}
                                        options={eligibleAthletes}
                                        value={athleteToAdd}
                                        onChange={(_e, v) => setAthleteToAdd(v)}
                                        getOptionLabel={(a) =>
                                            `${a.name} — ${a.country.replace(
                                                /_/g,
                                                " "
                                            )} (${a.gender === "MALE" ? "M" : "W"})`
                                        }
                                        isOptionEqualToValue={(a, b) =>
                                            a.id === b.id
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Search athlete to add"
                                                size="small"
                                            />
                                        )}
                                    />
                                    <Button
                                        variant="contained"
                                        disabled={
                                            participantsBusy || !athleteToAdd
                                        }
                                        onClick={handleAddParticipant}
                                    >
                                        Add
                                    </Button>
                                </Stack>
                            )}

                            <Divider />

                            {participants.length === 0 ? (
                                <Typography color="text.secondary">
                                    No athletes registered yet.
                                </Typography>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Athlete</TableCell>
                                                <TableCell>Country</TableCell>
                                                <TableCell align="right">
                                                    Remove
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {participants.map((p) => (
                                                <TableRow key={p.registrationId}>
                                                    <TableCell>
                                                        {p.athleteName}
                                                    </TableCell>
                                                    <TableCell>
                                                        {(p.country ?? "").replace(
                                                            /_/g,
                                                            " "
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            disabled={
                                                                participantsBusy ||
                                                                participantsComp.status ===
                                                                    "FINISHED"
                                                            }
                                                            onClick={() =>
                                                                handleRemoveParticipant(
                                                                    p.registrationId
                                                                )
                                                            }
                                                            aria-label="remove participant"
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setParticipantsComp(null)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default CreateCompetitionPage;
