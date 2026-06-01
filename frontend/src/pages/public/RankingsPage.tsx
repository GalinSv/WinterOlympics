import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import { getAllCompetitions } from "../../services/competitionService";
import {
    getBiathlonResults,
    getSlalomResults,
} from "../../services/resultService";

import type {
    BiathlonResult,
    Competition,
    SlalomResult,
} from "../../types/api";

type ResultRow = SlalomResult | BiathlonResult;

function formatTime(time?: number | null) {
    return typeof time === "number" ? time.toFixed(3) : "-";
}

// A competitor counts as ranked/finished only when they have a total time
// (slalom: both runs completed; biathlon: finished the race). This is the
// exact same condition the backend uses to assign finalRank, so Admin and
// the public Rankings page agree.
function isRanked(result: ResultRow) {
    return result.totalTime !== null && result.totalTime !== undefined;
}

const NO_RANK = Number.POSITIVE_INFINITY;
const NO_TIME = Number.POSITIVE_INFINITY;

// Total ordering: ranked athletes first (by finalRank), then any completed
// athletes not yet ranked (by total time), then DNF athletes last.
function sortResults(results: ResultRow[]) {
    return [...results].sort((a, b) => {
        const rankDiff = (a.finalRank ?? NO_RANK) - (b.finalRank ?? NO_RANK);
        if (rankDiff !== 0) return rankDiff;

        const timeDiff = (a.totalTime ?? NO_TIME) - (b.totalTime ?? NO_TIME);
        if (timeDiff !== 0) return timeDiff;

        return (a.athleteName ?? "").localeCompare(b.athleteName ?? "");
    });
}

function RankingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [selectedKey, setSelectedKey] = useState("");
    const [results, setResults] = useState<ResultRow[]>([]);
    const [loadingCompetitions, setLoadingCompetitions] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAllCompetitions()
            .then((loadedCompetitions) => {
                setCompetitions(loadedCompetitions);

                const urlSport = searchParams.get("sport");
                const urlId = searchParams.get("id");
                const matched =
                    urlSport && urlId
                        ? loadedCompetitions.find(
                              (c) =>
                                  c.sport === urlSport &&
                                  c.id === Number(urlId)
                          )
                        : undefined;
                const target = matched ?? loadedCompetitions[0];
                if (target) {
                    setSelectedKey(`${target.sport}:${target.id}`);
                }
            })
            .catch(() => setError("Could not load competitions."))
            .finally(() => setLoadingCompetitions(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectedCompetition = useMemo(() => {
        const [sport, id] = selectedKey.split(":");
        return competitions.find(
            (competition) =>
                competition.sport === sport && competition.id === Number(id)
        );
    }, [competitions, selectedKey]);

    const isSlalom = selectedCompetition?.sport === "slalom";

    useEffect(() => {
        if (!selectedCompetition) {
            setResults([]);
            return;
        }

        setLoadingResults(true);
        setError(null);

        const loadResults =
            selectedCompetition.sport === "slalom"
                ? getSlalomResults
                : getBiathlonResults;

        loadResults(selectedCompetition.id)
            .then((loadedResults) => setResults(sortResults(loadedResults)))
            .catch(() => setError("Could not load ranking results."))
            .finally(() => setLoadingResults(false));
    }, [selectedCompetition]);

    if (loadingCompetitions) {
        return <CircularProgress />;
    }

    const columnCount = isSlalom ? 7 : 7;

    return (
        <Box>
            <Typography
                component="h1"
                variant="h4"
                sx={{ mb: 1, fontWeight: 700 }}
            >
                Rankings
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Final standings are sorted by rank; athletes who did not finish
                (DNF) appear last.
            </Typography>

            <Stack spacing={2.5}>
                {error && <Alert severity="error">{error}</Alert>}

                {competitions.length === 0 ? (
                    <Alert severity="info">
                        No competitions are available yet.
                    </Alert>
                ) : (
                    <FormControl sx={{ maxWidth: 420 }} fullWidth>
                        <InputLabel id="competition-select-label">
                            Competition
                        </InputLabel>
                        <Select
                            labelId="competition-select-label"
                            label="Competition"
                            value={selectedKey}
                            onChange={(event) => {
                                setSelectedKey(event.target.value);
                                const [sport, id] =
                                    event.target.value.split(":");
                                setSearchParams({ sport, id });
                            }}
                        >
                            {competitions.map((competition) => (
                                <MenuItem
                                    key={`${competition.sport}-${competition.id}`}
                                    value={`${competition.sport}:${competition.id}`}
                                >
                                    {competition.name} (
                                    {competition.sport === "slalom"
                                        ? "Ski slalom"
                                        : "Biathlon"}
                                    )
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {loadingResults ? (
                    <CircularProgress />
                ) : (
                    selectedCompetition && (
                        <TableContainer
                            component={Paper}
                            variant="outlined"
                            sx={{
                                overflow: "hidden",
                                "& tbody tr:nth-of-type(odd)": {
                                    backgroundColor: "#f8fafc",
                                },
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={70}>Rank</TableCell>
                                        <TableCell>Athlete</TableCell>
                                        <TableCell>Country</TableCell>
                                        {isSlalom ? (
                                            <>
                                                <TableCell align="right">
                                                    Run 1
                                                </TableCell>
                                                <TableCell align="right">
                                                    Run 2
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell align="right">
                                                    Ski time
                                                </TableCell>
                                                <TableCell align="right">
                                                    Penalty
                                                </TableCell>
                                            </>
                                        )}
                                        <TableCell align="right">
                                            Total
                                        </TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {results.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={columnCount}>
                                                No results have been entered for
                                                this competition yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        results.map((result) => {
                                            const ranked = isRanked(result);
                                            const slalom = result as SlalomResult;
                                            const biathlon =
                                                result as BiathlonResult;
                                            return (
                                                <TableRow
                                                    key={result.id}
                                                    hover
                                                    sx={{
                                                        opacity: ranked ? 1 : 0.6,
                                                    }}
                                                >
                                                    <TableCell>
                                                        {result.finalRank ?? "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {result.athleteName ??
                                                            `Registration ${result.registrationId}`}
                                                    </TableCell>
                                                    <TableCell>
                                                        {(
                                                            result.country ?? "-"
                                                        ).replace(/_/g, " ")}
                                                    </TableCell>
                                                    {isSlalom ? (
                                                        <>
                                                            <TableCell align="right">
                                                                {ranked
                                                                    ? formatTime(
                                                                          slalom.firstRunTime
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {ranked
                                                                    ? formatTime(
                                                                          slalom.secondRunTime
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TableCell align="right">
                                                                {ranked
                                                                    ? formatTime(
                                                                          biathlon.skiingTime
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {ranked
                                                                    ? formatTime(
                                                                          biathlon.penaltySeconds
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                        </>
                                                    )}
                                                    <TableCell align="right">
                                                        {formatTime(
                                                            result.totalTime
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            label={
                                                                ranked
                                                                    ? "Finished"
                                                                    : "DNF"
                                                            }
                                                            color={
                                                                ranked
                                                                    ? "success"
                                                                    : "default"
                                                            }
                                                            variant={
                                                                ranked
                                                                    ? "filled"
                                                                    : "outlined"
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )
                )}
            </Stack>
        </Box>
    );
}

export default RankingsPage;
