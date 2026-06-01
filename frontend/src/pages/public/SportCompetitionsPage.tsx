import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
    Pagination,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";

import type {
    Competition,
    Gender,
} from "../../types/api";

import { getCurrentAthlete } from "../../services/athleteService";
import {
    registerForCompetition,
    getRegistrationsByAthlete,
    cancelRegistration,
} from "../../services/registrationService";
import { hasRole, isAuthenticated } from "../../utils/jwt";
import { notify } from "../../utils/notify";

type GenderFilter =
    | "ALL"
    | Gender;

type SortOrder = "DATE_DESC" | "DATE_ASC";

type Props<TCompetition extends Competition> = {
    title: string;
    description: string;
    emptyMessage: string;
    chipColor: "primary" | "success";
    loadCompetitions: () => Promise<TCompetition[]>;
    renderDetails: (competition: TCompetition) => string;
};

function getGenderLabel(gender: Gender) {
    return gender === "MALE"
        ? "Men"
        : "Women";
}

function SportCompetitionsPage<TCompetition extends Competition>({
    title,
    description,
    emptyMessage,
    chipColor,
    loadCompetitions,
    renderDetails,
}: Props<TCompetition>) {
    const navigate = useNavigate();

    const [competitions, setCompetitions] =
        useState<TCompetition[]>([]);

    const [genderFilter, setGenderFilter] =
        useState<GenderFilter>("ALL");

    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<SortOrder>("DATE_DESC");
    const [statusFilter, setStatusFilter] = useState<
        "ALL" | "ONGOING" | "FINALIZED"
    >("ALL");
    const [page, setPage] = useState(1);
    const [athleteId, setAthleteId] = useState<number | null>(null);
    const [registrations, setRegistrations] = useState<
        Record<number, { registrationId: number; status: string }>
    >({});
    const [busyId, setBusyId] = useState<number | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const canRegister = isAuthenticated() && hasRole("ROLE_ATHLETE");

    useEffect(() => {
        loadCompetitions()
            .then(setCompetitions)
            .catch(() =>
                setError("Could not load competitions.")
            )
            .finally(() => setLoading(false));
    }, [loadCompetitions]);

    useEffect(() => {
        if (!canRegister) return;
        getCurrentAthlete()
            .then((me) => setAthleteId(me.id ?? null))
            .catch(() => setAthleteId(null));
    }, [canRegister]);

    const loadRegistrations = useCallback((id: number) => {
        getRegistrationsByAthlete(id)
            .then((regs) => {
                const map: Record<
                    number,
                    { registrationId: number; status: string }
                > = {};
                for (const r of regs) {
                    map[r.competitionId] = {
                        registrationId: r.registrationId,
                        status: r.status,
                    };
                }
                setRegistrations(map);
            })
            .catch(() => setRegistrations({}));
    }, []);

    useEffect(() => {
        if (athleteId) loadRegistrations(athleteId);
    }, [athleteId, loadRegistrations]);

    const filteredCompetitions = useMemo(() => {
        let list = competitions;
        if (genderFilter !== "ALL") {
            list = list.filter((c) => c.gender === genderFilter);
        }
        if (statusFilter === "ONGOING") {
            list = list.filter((c) => c.status !== "FINISHED");
        } else if (statusFilter === "FINALIZED") {
            list = list.filter((c) => c.status === "FINISHED");
        }
        const q = search.trim().toLowerCase();
        if (q) {
            list = list.filter((c) => c.name.toLowerCase().includes(q));
        }
        const sorted = [...list].sort((a, b) =>
            sortOrder === "DATE_DESC"
                ? b.date.localeCompare(a.date)
                : a.date.localeCompare(b.date)
        );
        return sorted;
    }, [competitions, genderFilter, statusFilter, search, sortOrder]);

    const PER_PAGE = 15;
    const pageCount = Math.max(
        1,
        Math.ceil(filteredCompetitions.length / PER_PAGE)
    );
    const pagedCompetitions = filteredCompetitions.slice(
        (page - 1) * PER_PAGE,
        page * PER_PAGE
    );

    useEffect(() => {
        setPage(1);
    }, [genderFilter, statusFilter, search, sortOrder]);

    async function handleRegister(competition: TCompetition) {
        if (!athleteId) return;
        setBusyId(competition.id);
        try {
            await registerForCompetition(athleteId, competition.id);
            notify.success(`Registered for ${competition.name}.`);
            loadRegistrations(athleteId);
        } catch (e) {
            notify.error(e, "Could not register for this competition.");
        } finally {
            setBusyId(null);
        }
    }

    async function handleUnregister(competition: TCompetition) {
        if (!athleteId) return;
        const registration = registrations[competition.id];
        if (!registration) return;
        setBusyId(competition.id);
        try {
            await cancelRegistration(registration.registrationId);
            notify.success(`Unregistered from ${competition.name}.`);
            loadRegistrations(athleteId);
        } catch (e) {
            notify.error(e, "Could not unregister from this competition.");
        } finally {
            setBusyId(null);
        }
    }

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Stack
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Box>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ fontWeight: 700 }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        {description}
                    </Typography>
                </Box>

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
                        value={genderFilter}
                        exclusive
                        onChange={(_e: unknown, value: GenderFilter | null) => {
                            if (value) setGenderFilter(value);
                        }}
                        size="small"
                        aria-label="gender filter"
                    >
                        <ToggleButton value="ALL">All</ToggleButton>
                        <ToggleButton value="MALE">Men</ToggleButton>
                        <ToggleButton value="FEMALE">Women</ToggleButton>
                    </ToggleButtonGroup>

                    <ToggleButtonGroup
                        value={sortOrder}
                        exclusive
                        onChange={(_e: unknown, value: SortOrder | null) => {
                            if (value) setSortOrder(value);
                        }}
                        size="small"
                        aria-label="sort by date"
                    >
                        <ToggleButton value="DATE_DESC">Newest first</ToggleButton>
                        <ToggleButton value="DATE_ASC">Oldest first</ToggleButton>
                    </ToggleButtonGroup>

                    <ToggleButtonGroup
                        value={statusFilter}
                        exclusive
                        onChange={(
                            _e: unknown,
                            value: "ALL" | "ONGOING" | "FINALIZED" | null
                        ) => {
                            if (value) setStatusFilter(value);
                        }}
                        size="small"
                        aria-label="status filter"
                    >
                        <ToggleButton value="ALL">All</ToggleButton>
                        <ToggleButton value="ONGOING">Ongoing</ToggleButton>
                        <ToggleButton value="FINALIZED">Finalized</ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
            </Stack>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>
            )}

            {!error && filteredCompetitions.length === 0 && (
                <Alert severity="info">
                    {emptyMessage}
                </Alert>
            )}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 2,
                }}
            >
                {pagedCompetitions.map((competition) => (
                    <Card
                        key={`${competition.sport}-${competition.id}`}
                        variant="outlined"
                        onClick={() =>
                            navigate(
                                `/rankings?sport=${competition.sport}&id=${competition.id}`
                            )
                        }
                        sx={{
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            "&:hover": {
                                boxShadow: 4,
                                transform: "translateY(-3px)",
                                borderColor: "primary.light",
                            },
                        }}
                    >
                        <CardContent sx={{ flexGrow: 1, width: "100%" }}>
                            <Stack spacing={1.25}>
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    useFlexGap
                                    sx={{
                                        flexWrap: "wrap",
                                        minHeight: 56,
                                        alignContent: "flex-start",
                                    }}
                                >
                                    <Chip
                                        label={getGenderLabel(
                                            competition.gender
                                        )}
                                        size="small"
                                        color={chipColor}
                                    />

                                    <Chip
                                        label={`Minimum age ${competition.minimumAge}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                    {competition.status && (
                                        <Chip
                                            label={competition.status}
                                            size="small"
                                            variant="outlined"
                                            color={
                                                competition.status === "FINISHED"
                                                    ? "default"
                                                    : "warning"
                                            }
                                        />
                                    )}
                                    {registrations[competition.id] && (
                                        <Chip
                                            label={`Registered · ${
                                                registrations[competition.id]
                                                    .status
                                            }`}
                                            size="small"
                                            color="success"
                                        />
                                    )}
                                </Stack>

                                <Typography
                                    component="h2"
                                    variant="h6"
                                >
                                    {competition.name}
                                </Typography>

                                <Typography color="text.secondary">
                                    Date: {competition.date}
                                </Typography>

                                <Typography color="text.secondary">
                                    {renderDetails(competition)}
                                </Typography>
                            </Stack>
                        </CardContent>
                        {canRegister && competition.status !== "FINISHED" && (
                            <CardActions onClick={(e) => e.stopPropagation()}>
                                {registrations[competition.id] ? (
                                    <Button
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                        disabled={
                                            !athleteId ||
                                            busyId === competition.id
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnregister(competition);
                                        }}
                                    >
                                        {busyId === competition.id
                                            ? "Working..."
                                            : "Unregister"}
                                    </Button>
                                ) : (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        disabled={
                                            !athleteId ||
                                            busyId === competition.id
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRegister(competition);
                                        }}
                                    >
                                        {busyId === competition.id
                                            ? "Registering..."
                                            : "Register"}
                                    </Button>
                                )}
                            </CardActions>
                        )}
                    </Card>
                ))}
            </Box>

            {pageCount > 1 && (
                <Stack direction="row" sx={{ mt: 3, justifyContent: "center" }}>
                    <Pagination
                        count={pageCount}
                        page={page}
                        onChange={(_e, value) => setPage(value)}
                        color="primary"
                    />
                </Stack>
            )}
        </Box>
    );
}

export default SportCompetitionsPage;
