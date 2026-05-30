import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
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
    Typography,
    Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import {
    getAllCompetitions,
    runSlalomDemo,
    runBiathlonDemo,
    assignSlalomMedals,
    assignBiathlonMedals,
} from "../../services/competitionService";
import {
    getRegistrationsByCompetition,
    registerForCompetition,
    cancelRegistration,
} from "../../services/registrationService";
import { getAllAthletes } from "../../services/athleteService";
import {
    calculateBiathlonRanking,
    calculateSlalomQualifications,
    calculateSlalomRanking,
    getBiathlonResults,
    getSlalomResults,
    saveBiathlonResult,
    saveSlalomFirstRun,
    saveSlalomSecondRun,
} from "../../services/resultService";

import type {
    Athlete,
    BiathlonResult,
    Competition,
    Registration,
    SlalomResult,
} from "../../types/api";

type RowState = {
    firstRunTime: string;
    secondRunTime: string;
    skiingTime: string;
    missedShots: string;
    finished: boolean;
};

const EMPTY_ROW: RowState = {
    firstRunTime: "",
    secondRunTime: "",
    skiingTime: "",
    missedShots: "0",
    finished: true,
};

function EnterResultsPage() {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [selectedKey, setSelectedKey] = useState("");
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [slalomResults, setSlalomResults] = useState<SlalomResult[]>([]);
    const [biathlonResults, setBiathlonResults] = useState<BiathlonResult[]>([]);
    const [rows, setRows] = useState<Record<number, RowState>>({});
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [athleteToAdd, setAthleteToAdd] = useState<Athlete | null>(null);

    useEffect(() => {
        Promise.all([getAllCompetitions(), getAllAthletes()])
            .then(([all, ath]) => {
                setCompetitions(all);
                setAthletes(ath);
                if (all[0]) setSelectedKey(`${all[0].sport}:${all[0].id}`);
            })
            .catch(() => setError("Could not load competitions or athletes."))
            .finally(() => setLoading(false));
    }, []);

    const selected = useMemo(() => {
        const [sport, id] = selectedKey.split(":");
        return competitions.find(
            (c) => c.sport === sport && c.id === Number(id)
        );
    }, [competitions, selectedKey]);

    async function loadDetails() {
        if (!selected) return;
        setError("");
        setMessage("");
        try {
            const regs = await getRegistrationsByCompetition(selected.id);
            setRegistrations(regs);
            if (selected.sport === "slalom") {
                setSlalomResults(await getSlalomResults(selected.id));
                setBiathlonResults([]);
            } else {
                setBiathlonResults(await getBiathlonResults(selected.id));
                setSlalomResults([]);
            }
            const fresh: Record<number, RowState> = {};
            regs.forEach((r) => (fresh[r.registrationId] = { ...EMPTY_ROW }));
            setRows(fresh);
        } catch (e) {
            console.error(e);
            setError("Could not load registrations or results.");
        }
    }

    useEffect(() => {
        loadDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedKey]);

    function update(regId: number, patch: Partial<RowState>) {
        setRows((prev) => ({
            ...prev,
            [regId]: { ...(prev[regId] ?? EMPTY_ROW), ...patch },
        }));
    }

    function existingSlalom(regId: number) {
        return slalomResults.find((r) => r.registrationId === regId);
    }

    function existingBiathlon(regId: number) {
        return biathlonResults.find((r) => r.registrationId === regId);
    }

    async function handleSaveSlalomFirst(regId: number) {
        const row = rows[regId];
        if (!row?.firstRunTime) return;
        setBusy(true);
        try {
            await saveSlalomFirstRun(
                regId,
                Number(row.firstRunTime),
                row.finished
            );
            setMessage("First-run time saved.");
            await loadDetails();
        } catch (e) {
            console.error(e);
            setError("Could not save first-run time.");
        } finally {
            setBusy(false);
        }
    }

    async function handleSaveSlalomSecond(regId: number) {
        const row = rows[regId];
        if (!row?.secondRunTime) return;
        setBusy(true);
        try {
            await saveSlalomSecondRun(
                regId,
                Number(row.secondRunTime),
                row.finished
            );
            setMessage("Second-run time saved.");
            await loadDetails();
        } catch (e) {
            console.error(e);
            setError("Could not save second-run time.");
        } finally {
            setBusy(false);
        }
    }

    async function handleSaveBiathlon(regId: number) {
        const row = rows[regId];
        if (!row?.skiingTime) return;
        setBusy(true);
        try {
            await saveBiathlonResult(
                regId,
                Number(row.skiingTime),
                Number(row.missedShots || "0"),
                row.finished
            );
            setMessage("Biathlon result saved.");
            await loadDetails();
        } catch (e) {
            console.error(e);
            setError("Could not save biathlon result.");
        } finally {
            setBusy(false);
        }
    }

    async function handleAction(
        action: () => Promise<unknown>,
        successMessage: string
    ) {
        if (!selected) return;
        setBusy(true);
        setError("");
        setMessage("");
        try {
            await action();
            setMessage(successMessage);
            await loadDetails();
        } catch (e) {
            console.error(e);
            setError("Action failed.");
        } finally {
            setBusy(false);
        }
    }

    async function refreshCompetitions() {
        try {
            const all = await getAllCompetitions();
            setCompetitions(all);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleGenerateDemo() {
        if (!selected) return;
        if (selected.status === "FINISHED") {
            setError("Competition is already finalized.");
            return;
        }
        setBusy(true);
        setError("");
        setMessage("");
        try {
            if (selected.sport === "slalom") {
                await runSlalomDemo(selected.id);
                await assignSlalomMedals(selected.id);
            } else {
                await runBiathlonDemo(selected.id);
                await assignBiathlonMedals(selected.id);
            }
            setMessage(
                "Demo completed: athletes registered, results generated, ranking calculated, medals awarded, competition finalized."
            );
            await refreshCompetitions();
            await loadDetails();
        } catch (e) {
            console.error(e);
            setError("Could not run demo. Make sure enough eligible athletes exist.");
        } finally {
            setBusy(false);
        }
    }

    async function handleAddAthlete() {
        if (!selected || !athleteToAdd?.id) return;
        setBusy(true);
        setError("");
        setMessage("");
        try {
            await registerForCompetition(athleteToAdd.id, selected.id);
            setMessage(`${athleteToAdd.name} added to ${selected.name}.`);
            setAthleteToAdd(null);
            await loadDetails();
        } catch (e) {
            console.error(e);
            setError(
                "Could not add athlete. Check gender/age requirements or if already registered."
            );
        } finally {
            setBusy(false);
        }
    }

    async function handleRemoveAthlete(registrationId: number) {
        if (!selected) return;
        setBusy(true);
        setError("");
        setMessage("");
        try {
            await cancelRegistration(registrationId);
            setMessage("Athlete removed from competition.");
            await loadDetails();
        } catch (e) {
            console.error(e);
            setError("Could not remove athlete.");
        } finally {
            setBusy(false);
        }
    }

    const eligibleAthletes = useMemo(() => {
        if (!selected) return [] as Athlete[];
        const registeredIds = new Set(
            registrations.map((r) => r.athleteId)
        );
        return athletes.filter(
            (a) =>
                a.id !== undefined &&
                !registeredIds.has(a.id) &&
                a.gender === selected.gender
        );
    }, [athletes, registrations, selected]);

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Typography
                component="h1"
                variant="h4"
                sx={{ mb: 3, fontWeight: 700 }}
            >
                Enter Results
            </Typography>

            <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
                {message && <Alert severity="success">{message}</Alert>}

                <Card variant="outlined">
                    <CardContent>
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                            sx={{ alignItems: { md: "center" }, flexWrap: "wrap" }}
                        >
                            <FormControl sx={{ minWidth: 320 }}>
                                <InputLabel id="comp-label">Competition</InputLabel>
                                <Select
                                    labelId="comp-label"
                                    label="Competition"
                                    value={selectedKey}
                                    onChange={(e) => setSelectedKey(e.target.value)}
                                >
                                    {competitions.map((c) => (
                                        <MenuItem
                                            key={`${c.sport}-${c.id}`}
                                            value={`${c.sport}:${c.id}`}
                                        >
                                            {c.name} (
                                            {c.sport === "slalom"
                                                ? "Slalom"
                                                : "Biathlon"}
                                            ){c.status ? ` — ${c.status}` : ""}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {selected?.status && (
                                <Chip
                                    label={selected.status}
                                    color={
                                        selected.status === "FINISHED"
                                            ? "default"
                                            : "warning"
                                    }
                                    variant="outlined"
                                />
                            )}

                            <Button
                                variant="contained"
                                color="secondary"
                                disabled={busy || !selected || selected.status === "FINISHED"}
                                onClick={handleGenerateDemo}
                            >
                                Generate Demo Results
                            </Button>

                            {selected?.sport === "slalom" && (
                                <>
                                    <Button
                                        variant="outlined"
                                        disabled={busy}
                                        onClick={() =>
                                            handleAction(
                                                () =>
                                                    calculateSlalomQualifications(
                                                        selected.id
                                                    ),
                                                "Qualifications calculated."
                                            )
                                        }
                                    >
                                        Calculate qualifications
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        disabled={busy}
                                        onClick={() =>
                                            handleAction(
                                                () =>
                                                    calculateSlalomRanking(
                                                        selected.id
                                                    ),
                                                "Final ranking calculated."
                                            )
                                        }
                                    >
                                        Calculate ranking
                                    </Button>
                                </>
                            )}

                            {selected?.sport === "biathlon" && (
                                <Button
                                    variant="outlined"
                                    disabled={busy}
                                    onClick={() =>
                                        handleAction(
                                            () =>
                                                calculateBiathlonRanking(
                                                    selected.id
                                                ),
                                            "Ranking calculated."
                                        )
                                    }
                                >
                                    Calculate ranking
                                </Button>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                {selected && selected.status !== "FINISHED" && (
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 1.5 }}>
                                Manage participants
                            </Typography>
                            <Stack
                                direction={{ xs: "column", md: "row" }}
                                spacing={2}
                                sx={{ alignItems: { md: "center" } }}
                            >
                                <Autocomplete
                                    sx={{ minWidth: 320, flex: 1 }}
                                    options={eligibleAthletes}
                                    value={athleteToAdd}
                                    onChange={(_e, v) => setAthleteToAdd(v)}
                                    getOptionLabel={(a) =>
                                        `${a.name} — ${a.country.replace(/_/g, " ")} (${a.gender})`
                                    }
                                    isOptionEqualToValue={(a, b) => a.id === b.id}
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
                                    disabled={busy || !athleteToAdd}
                                    onClick={handleAddAthlete}
                                >
                                    Add to competition
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {selected && (
                    <Card variant="outlined">
                        <CardContent>
                            {registrations.length === 0 ? (
                                <Alert severity="info">
                                    No athletes are registered for this competition.
                                </Alert>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Athlete</TableCell>
                                                <TableCell>Country</TableCell>
                                                {selected.sport === "slalom" ? (
                                                    <>
                                                        <TableCell>Run 1 (s)</TableCell>
                                                        <TableCell>Run 2 (s)</TableCell>
                                                        <TableCell>Total</TableCell>
                                                        <TableCell>Rank</TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell>Ski time (s)</TableCell>
                                                        <TableCell>Missed shots</TableCell>
                                                        <TableCell>Total</TableCell>
                                                        <TableCell>Rank</TableCell>
                                                    </>
                                                )}
                                                <TableCell>Finished?</TableCell>
                                                <TableCell align="right">
                                                    Actions
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {registrations.map((reg) => {
                                                const row =
                                                    rows[reg.registrationId] ??
                                                    EMPTY_ROW;
                                                const slalom = existingSlalom(
                                                    reg.registrationId
                                                );
                                                const biathlon = existingBiathlon(
                                                    reg.registrationId
                                                );
                                                return (
                                                    <TableRow key={reg.registrationId}>
                                                        <TableCell>
                                                            {reg.athleteName}
                                                        </TableCell>
                                                        <TableCell>
                                                            {reg.country}
                                                        </TableCell>

                                                        {selected.sport ===
                                                        "slalom" ? (
                                                            <>
                                                                <TableCell>
                                                                    <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        value={
                                                                            row.firstRunTime ||
                                                                            (slalom?.firstRunTime?.toString() ??
                                                                                "")
                                                                        }
                                                                        onChange={(e) =>
                                                                            update(
                                                                                reg.registrationId,
                                                                                {
                                                                                    firstRunTime:
                                                                                        e.target
                                                                                            .value,
                                                                                }
                                                                            )
                                                                        }
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        disabled={
                                                                            !slalom?.qualifiedForSecondRun
                                                                        }
                                                                        value={
                                                                            row.secondRunTime ||
                                                                            (slalom?.secondRunTime?.toString() ??
                                                                                "")
                                                                        }
                                                                        onChange={(e) =>
                                                                            update(
                                                                                reg.registrationId,
                                                                                {
                                                                                    secondRunTime:
                                                                                        e.target
                                                                                            .value,
                                                                                }
                                                                            )
                                                                        }
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    {slalom?.totalTime?.toFixed(
                                                                        3
                                                                    ) ?? "-"}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {slalom?.finalRank ??
                                                                        "-"}
                                                                </TableCell>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <TableCell>
                                                                    <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        value={
                                                                            row.skiingTime ||
                                                                            (biathlon?.skiingTime?.toString() ??
                                                                                "")
                                                                        }
                                                                        onChange={(e) =>
                                                                            update(
                                                                                reg.registrationId,
                                                                                {
                                                                                    skiingTime:
                                                                                        e.target
                                                                                            .value,
                                                                                }
                                                                            )
                                                                        }
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        value={
                                                                            row.missedShots ||
                                                                            (biathlon?.missedShots?.toString() ??
                                                                                "0")
                                                                        }
                                                                        onChange={(e) =>
                                                                            update(
                                                                                reg.registrationId,
                                                                                {
                                                                                    missedShots:
                                                                                        e.target
                                                                                            .value,
                                                                                }
                                                                            )
                                                                        }
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    {biathlon?.totalTime?.toFixed(
                                                                        3
                                                                    ) ?? "-"}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {biathlon?.finalRank ??
                                                                        "-"}
                                                                </TableCell>
                                                            </>
                                                        )}

                                                        <TableCell>
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={
                                                                            row.finished
                                                                        }
                                                                        onChange={(e) =>
                                                                            update(
                                                                                reg.registrationId,
                                                                                {
                                                                                    finished:
                                                                                        e.target
                                                                                            .checked,
                                                                                }
                                                                            )
                                                                        }
                                                                    />
                                                                }
                                                                label=""
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {selected.sport ===
                                                            "slalom" ? (
                                                                <Stack
                                                                    direction="row"
                                                                    spacing={1}
                                                                    sx={{ justifyContent: "flex-end" }}
                                                                >
                                                                    <Button
                                                                        size="small"
                                                                        disabled={busy}
                                                                        onClick={() =>
                                                                            handleSaveSlalomFirst(
                                                                                reg.registrationId
                                                                            )
                                                                        }
                                                                    >
                                                                        Save R1
                                                                    </Button>
                                                                    <Button
                                                                        size="small"
                                                                        disabled={
                                                                            busy ||
                                                                            !slalom?.qualifiedForSecondRun
                                                                        }
                                                                        onClick={() =>
                                                                            handleSaveSlalomSecond(
                                                                                reg.registrationId
                                                                            )
                                                                        }
                                                                    >
                                                                        Save R2
                                                                    </Button>
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        disabled={busy || selected.status === "FINISHED"}
                                                                        onClick={() =>
                                                                            handleRemoveAthlete(
                                                                                reg.registrationId
                                                                            )
                                                                        }
                                                                        aria-label="remove athlete"
                                                                    >
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Stack>
                                                            ) : (
                                                                <Stack
                                                                    direction="row"
                                                                    spacing={1}
                                                                    sx={{ justifyContent: "flex-end" }}
                                                                >
                                                                    <Button
                                                                        size="small"
                                                                        disabled={busy}
                                                                        onClick={() =>
                                                                            handleSaveBiathlon(
                                                                                reg.registrationId
                                                                            )
                                                                        }
                                                                    >
                                                                        Save
                                                                    </Button>
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        disabled={busy || selected.status === "FINISHED"}
                                                                        onClick={() =>
                                                                            handleRemoveAthlete(
                                                                                reg.registrationId
                                                                            )
                                                                        }
                                                                        aria-label="remove athlete"
                                                                    >
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Stack>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                )}
            </Stack>
        </Box>
    );
}

export default EnterResultsPage;
