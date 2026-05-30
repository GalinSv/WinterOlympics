import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
    Alert,
    Box,
    CircularProgress,
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

type ResultRow =
    | SlalomResult
    | BiathlonResult;

function formatTime(time?: number) {
    return typeof time === "number"
        ? time.toFixed(3)
        : "-";
}

function sortResults(results: ResultRow[]) {
    return [...results].sort((first, second) => {
        if (first.finalRank && second.finalRank) {
            return first.finalRank - second.finalRank;
        }

        if (first.totalTime && second.totalTime) {
            return first.totalTime - second.totalTime;
        }

        return first.registrationId - second.registrationId;
    });
}

function RankingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [competitions, setCompetitions] =
        useState<Competition[]>([]);

    const [selectedKey, setSelectedKey] =
        useState("");

    const [results, setResults] =
        useState<ResultRow[]>([]);

    const [loadingCompetitions, setLoadingCompetitions] =
        useState(true);

    const [loadingResults, setLoadingResults] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

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
            .catch(() =>
                setError("Could not load competitions.")
            )
            .finally(() => setLoadingCompetitions(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            .then((loadedResults) =>
                setResults(sortResults(loadedResults))
            )
            .catch(() =>
                setError("Could not load ranking results.")
            )
            .finally(() => setLoadingResults(false));
    }, [selectedCompetition]);

    if (loadingCompetitions) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Typography
                component="h1"
                variant="h4"
                sx={{ mb: 3, fontWeight: 700 }}
            >
                Rankings
            </Typography>

            <Stack spacing={2.5}>
                {error && (
                    <Alert severity="error">
                        {error}
                    </Alert>
                )}

                {competitions.length === 0 ? (
                    <Alert severity="info">
                        No competitions are available yet.
                    </Alert>
                ) : (
                    <FormControl
                        sx={{ maxWidth: 420 }}
                        fullWidth
                    >
                        <InputLabel id="competition-select-label">
                            Competition
                        </InputLabel>

                        <Select
                            labelId="competition-select-label"
                            label="Competition"
                            value={selectedKey}
                            onChange={(event) => {
                                setSelectedKey(event.target.value);
                                const [sport, id] = event.target.value.split(":");
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
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Rank</TableCell>
                                        <TableCell>Athlete</TableCell>
                                        <TableCell>Country</TableCell>
                                        <TableCell align="right">
                                            Total time
                                        </TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {results.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                No results have been entered
                                                for this competition yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        results.map((result) => (
                                            <TableRow key={result.id}>
                                                <TableCell>
                                                    {result.finalRank ?? "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {result.athleteName ??
                                                        `Registration ${result.registrationId}`}
                                                </TableCell>
                                                <TableCell>
                                                    {result.country ?? "-"}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {formatTime(
                                                        result.totalTime
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {result.finished
                                                        ? "Finished"
                                                        : "DNF"}
                                                </TableCell>
                                            </TableRow>
                                        ))
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
