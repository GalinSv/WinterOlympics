import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    FormControl,
    FormControlLabel,
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

import { getAllCompetitions } from "../../services/competitionService";
import { getRegistrationsByCompetition } from "../../services/registrationService";
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
import { notify } from "../../utils/notify";

import type {
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

function genderLabel(gender: string) {
    return gender === "MALE" ? "Men" : "Women";
}

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

    useEffect(() => {
        getAllCompetitions()
            .then((all) => {
                setCompetitions(all);
                if (all[0]) setSelectedKey(`${all[0].sport}:${all[0].id}`);
            })
            .catch(() => setError("Could not load competitions."))
            .finally(() => setLoading(false));
    }, []);

    const selected = useMemo(() => {
        const [sport, id] = selectedKey.split(":");
        return competitions.find(
            (c) => c.sport === sport && c.id === Number(id)
        );
    }, [competitions, selectedKey]);

    const locked = selected?.status === "FINISHED";

    async function loadDetails() {
        if (!selected) return;
        setError("");
        try {
            const regs = await getRegistrationsByCompetition(selected.id);
            setRegistrations(regs);

            let slalom: SlalomResult[] = [];
            let biathlon: BiathlonResult[] = [];
            if (selected.sport === "slalom") {
                slalom = await getSlalomResults(selected.id);
                setSlalomResults(slalom);
                setBiathlonResults([]);
            } else {
                biathlon = await getBiathlonResults(selected.id);
                setBiathlonResults(biathlon);
                setSlalomResults([]);
            }

            // Seed each row from the saved result so the inputs and the
            // "Finished?" checkbox reflect what is actually stored.
            const fresh: Record<number, RowState> = {};
            regs.forEach((r) => {
                const s = slalom.find(
                    (x) => x.registrationId === r.registrationId
                );
                const b = biathlon.find(
                    (x) => x.registrationId === r.registrationId
                );
                const existing = s ?? b;
                fresh[r.registrationId] = {
                    firstRunTime: s?.firstRunTime?.toString() ?? "",
                    secondRunTime: s?.secondRunTime?.toString() ?? "",
                    skiingTime: b?.skiingTime?.toString() ?? "",
                    missedShots: b?.missedShots?.toString() ?? "0",
                    finished: existing ? Boolean(existing.finished) : true,
                };
            });
            setRows(fresh);
        } catch (e) {
            setError("Could not load registrations or results.");
            notify.error(e, "Could not load registrations or results.");
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
            await saveSlalomFirstRun(regId, Number(row.firstRunTime), row.finished);
            notify.success("First-run time saved.");
            await loadDetails();
        } catch (e) {
            notify.error(e, "Could not save first-run time.");
        } finally {
            setBusy(false);
        }
    }

    async function handleSaveSlalomSecond(regId: number) {
        const row = rows[regId];
        if (!row?.secondRunTime) return;
        setBusy(true);
        try {
            await saveSlalomSecondRun(regId, Number(row.secondRunTime), row.finished);
            notify.success("Second-run time saved.");
            await loadDetails();
        } catch (e) {
            notify.error(e, "Could not save second-run time.");
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
            notify.success("Biathlon result saved.");
            await loadDetails();
        } catch (e) {
            notify.error(e, "Could not save biathlon result.");
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
        try {
            await action();
            notify.success(successMessage);
            await loadDetails();
        } catch (e) {
            notify.error(e, "Action failed.");
        } finally {
            setBusy(false);
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
                Enter Results
            </Typography>

            <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}

                <Card>
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

                            {selected && (
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ flexWrap: "wrap" }}
                                >
                                    <Chip
                                        label={
                                            selected.sport === "slalom"
                                                ? "Ski slalom"
                                                : "Biathlon"
                                        }
                                        color="primary"
                                    />
                                    <Chip
                                        label={genderLabel(selected.gender)}
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={`Min age ${selected.minimumAge}`}
                                        variant="outlined"
                                    />
                                    {selected.status && (
                                        <Chip
                                            label={selected.status}
                                            color={
                                                locked ? "default" : "warning"
                                            }
                                            variant="outlined"
                                        />
                                    )}
                                </Stack>
                            )}
                        </Stack>

                        {selected && (
                            <Typography
                                variant="h6"
                                sx={{ mt: 2 }}
                            >
                                {selected.name}
                            </Typography>
                        )}

                        {selected && (
                            <Stack
                                direction="row"
                                spacing={1.5}
                                sx={{ mt: 2, flexWrap: "wrap" }}
                            >
                                {selected.sport === "slalom" && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            disabled={busy || locked}
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
                                            disabled={busy || locked}
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
                                {selected.sport === "biathlon" && (
                                    <Button
                                        variant="outlined"
                                        disabled={busy || locked}
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
                        )}
                    </CardContent>
                </Card>

                {locked && (
                    <Alert severity="info">
                        This competition is finalized. Results are read-only.
                    </Alert>
                )}

                {selected && (
                    <Card>
                        <CardContent>
                            {registrations.length === 0 ? (
                                <Alert severity="info">
                                    No athletes are registered for this
                                    competition. Add participants from Manage
                                    Competitions.
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
                                                            {(reg.country ?? "").replace(
                                                                /_/g,
                                                                " "
                                                            )}
                                                        </TableCell>

                                                        {selected.sport ===
                                                        "slalom" ? (
                                                            <>
                                                                <TableCell>
                                                                    <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        disabled={locked}
                                                                        value={
                                                                            row.firstRunTime
                                                                        }
                                                                        onChange={(e) =>
                                                                            update(
                                                                                reg.registrationId,
                                                                                {
                                                                                    firstRunTime:
                                                                                        e.target.value,
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
                                                                            locked ||
                                                                            !slalom?.qualifiedForSecondRun
                                                                        }
                                                                        value={
                                                                            row.secondRunTime
                                                                        }
                                                                        onChange={(e) =>
                                                                            update(
                                                                                reg.registrationId,
                                                                                {
                                                                                    secondRunTime:
                                                                                        e.target.value,
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
                                                                        disabled={locked}
                                                                        value={
                                                                            row.skiingTime
                                                                        }
                                                                        onChange={(e) =>
                                                                            update(
                                                                                reg.registrationId,
                                                                                {
                                                                                    skiingTime:
                                                                                        e.target.value,
                                                                                }
                                                                            )
                                                                        }
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        disabled={locked}
                                                                        value={
                                                                            row.missedShots
                                                                        }
                                                                        onChange={(e) =>
                                                                            update(
                                                                                reg.registrationId,
                                                                                {
                                                                                    missedShots:
                                                                                        e.target.value,
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
                                                                        disabled={locked}
                                                                        checked={
                                                                            row.finished
                                                                        }
                                                                        onChange={(e) =>
                                                                            update(
                                                                                reg.registrationId,
                                                                                {
                                                                                    finished:
                                                                                        e.target.checked,
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
                                                                    sx={{
                                                                        justifyContent:
                                                                            "flex-end",
                                                                    }}
                                                                >
                                                                    <Button
                                                                        size="small"
                                                                        disabled={
                                                                            busy || locked
                                                                        }
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
                                                                            locked ||
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
                                                                </Stack>
                                                            ) : (
                                                                <Button
                                                                    size="small"
                                                                    disabled={
                                                                        busy || locked
                                                                    }
                                                                    onClick={() =>
                                                                        handleSaveBiathlon(
                                                                            reg.registrationId
                                                                        )
                                                                    }
                                                                >
                                                                    Save
                                                                </Button>
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
