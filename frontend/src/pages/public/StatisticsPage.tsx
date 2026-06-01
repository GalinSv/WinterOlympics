import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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

import { getOlympicStatistics } from "../../services/statisticsService";
import { getAllCompetitions } from "../../services/competitionService";
import {
    getBiathlonResults,
    getSlalomResults,
} from "../../services/resultService";

import type { OlympicStatistics } from "../../types/api";
import { COUNTRIES } from "../../types/api";

type MedalType = "GOLD" | "SILVER" | "BRONZE";

type MedalRecord = {
    athleteName: string;
    country: string;
    competitionName: string;
    medal: MedalType;
};

type CountryBreakdown = {
    country: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
};

function StatisticsPage() {

    const [statistics, setStatistics] =
        useState<OlympicStatistics | null>(null);

    const [medals, setMedals] = useState<MedalRecord[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [countryFilter, setCountryFilter] = useState<string>("ALL");
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const [stats, comps] = await Promise.all([
                    getOlympicStatistics(),
                    getAllCompetitions(),
                ]);
                setStatistics(stats);

                const allMedals: MedalRecord[] = [];
                await Promise.all(
                    comps.map(async (c) => {
                        try {
                            const results =
                                c.sport === "slalom"
                                    ? await getSlalomResults(c.id)
                                    : await getBiathlonResults(c.id);
                            results.forEach((r) => {
                                if (
                                    r.finalRank &&
                                    r.finalRank >= 1 &&
                                    r.finalRank <= 3 &&
                                    r.athleteName &&
                                    r.country
                                ) {
                                    const medal: MedalType =
                                        r.finalRank === 1
                                            ? "GOLD"
                                            : r.finalRank === 2
                                              ? "SILVER"
                                              : "BRONZE";
                                    allMedals.push({
                                        athleteName: r.athleteName,
                                        country: r.country,
                                        competitionName: c.name,
                                        medal,
                                    });
                                }
                            });
                        } catch {
                            /* ignore competitions without results */
                        }
                    })
                );
                setMedals(allMedals);
            } catch {
                setError("Could not load statistics.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const breakdown = useMemo<CountryBreakdown[]>(() => {
        const byCountry = new Map<string, CountryBreakdown>();
        medals.forEach((m) => {
            const entry =
                byCountry.get(m.country) ?? {
                    country: m.country,
                    gold: 0,
                    silver: 0,
                    bronze: 0,
                    total: 0,
                };
            if (m.medal === "GOLD") entry.gold += 1;
            if (m.medal === "SILVER") entry.silver += 1;
            if (m.medal === "BRONZE") entry.bronze += 1;
            entry.total += 1;
            byCountry.set(m.country, entry);
        });
        const list = Array.from(byCountry.values()).sort((a, b) => {
            if (b.gold !== a.gold) return b.gold - a.gold;
            if (b.silver !== a.silver) return b.silver - a.silver;
            if (b.bronze !== a.bronze) return b.bronze - a.bronze;
            return a.country.localeCompare(b.country);
        });
        if (countryFilter === "ALL") return list;
        return list.filter((r) => r.country === countryFilter);
    }, [medals, countryFilter]);

    const selectedCountryMedals = useMemo(
        () =>
            selectedCountry
                ? medals.filter((m) => m.country === selectedCountry)
                : [],
        [medals, selectedCountry]
    );

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
                Olympic Statistics
            </Typography>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>
            )}

            {statistics && (
                <Stack spacing={3}>
                    <FormControl sx={{ maxWidth: 320 }}>
                        <InputLabel id="stats-country-label">
                            Filter by country
                        </InputLabel>
                        <Select
                            labelId="stats-country-label"
                            label="Filter by country"
                            value={countryFilter}
                            onChange={(event) =>
                                setCountryFilter(String(event.target.value))
                            }
                        >
                            <MenuItem value="ALL">All countries</MenuItem>
                            {COUNTRIES.map((country) => (
                                <MenuItem key={country} value={country}>
                                    {country.replace(/_/g, " ")}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: 2,
                        }}
                    >
                        <Card variant="outlined">
                            <CardContent>
                                <Typography color="text.secondary">
                                    Average athlete age
                                </Typography>
                                <Typography variant="h5">
                                    {statistics.averageAthleteAge.toFixed(1)}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card variant="outlined">
                            <CardContent>
                                <Typography color="text.secondary">
                                    Youngest medalist
                                </Typography>
                                <Typography variant="h5">
                                    {statistics.youngestMedalist ?? "N/A"}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card variant="outlined">
                            <CardContent>
                                <Typography color="text.secondary">
                                    Oldest medalist
                                </Typography>
                                <Typography variant="h5">
                                    {statistics.oldestMedalist ?? "N/A"}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>

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
                                    <TableCell>Country</TableCell>
                                    <TableCell align="right">Gold</TableCell>
                                    <TableCell align="right">Silver</TableCell>
                                    <TableCell align="right">Bronze</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {breakdown.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            No medals have been assigned yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    breakdown.map((row) => (
                                        <TableRow
                                            key={row.country}
                                            hover
                                            sx={{ cursor: "pointer" }}
                                            onClick={() =>
                                                setSelectedCountry(row.country)
                                            }
                                        >
                                            <TableCell>
                                                {row.country.replace(/_/g, " ")}
                                            </TableCell>
                                            <TableCell align="right">{row.gold}</TableCell>
                                            <TableCell align="right">{row.silver}</TableCell>
                                            <TableCell align="right">{row.bronze}</TableCell>
                                            <TableCell align="right">{row.total}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                </Stack>
            )}

            <Dialog
                open={Boolean(selectedCountry)}
                onClose={() => setSelectedCountry(null)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Medalists for {selectedCountry?.replace(/_/g, " ")}
                </DialogTitle>
                <DialogContent>
                    {selectedCountryMedals.length === 0 ? (
                        <Alert severity="info" sx={{ mt: 1 }}>
                            No medals recorded for this country.
                        </Alert>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Athlete</TableCell>
                                        <TableCell>Competition</TableCell>
                                        <TableCell>Medal</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedCountryMedals.map((m, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{m.athleteName}</TableCell>
                                            <TableCell>
                                                {m.competitionName}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={m.medal}
                                                    sx={{
                                                        bgcolor:
                                                            m.medal === "GOLD"
                                                                ? "#FFD700"
                                                                : m.medal ===
                                                                    "SILVER"
                                                                  ? "#C0C0C0"
                                                                  : "#CD7F32",
                                                        color: "#000",
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedCountry(null)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default StatisticsPage;
