import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import { getCurrentAthlete } from "../../services/athleteService";
import {
    cancelRegistration,
    getRegistrationsByAthlete,
} from "../../services/registrationService";

import type { Registration } from "../../types/api";

function MyRegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [athleteId, setAthleteId] = useState<number | null>(null);

    function load(id: number) {
        getRegistrationsByAthlete(id)
            .then(setRegistrations)
            .catch(() => setError("Could not load registrations."))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        getCurrentAthlete()
            .then((me) => {
                if (me.id) {
                    setAthleteId(me.id);
                    load(me.id);
                }
            })
            .catch(() => {
                setError("Could not load profile.");
                setLoading(false);
            });
    }, []);

    async function handleCancel(reg: Registration) {
        if (!athleteId) return;
        if (!window.confirm(`Cancel registration for "${reg.competitionName}"?`))
            return;
        try {
            await cancelRegistration(reg.registrationId);
            setMessage("Registration cancelled.");
            load(athleteId);
        } catch (e) {
            console.error(e);
            setError("Could not cancel registration.");
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
                My Registrations
            </Typography>

            <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
                {message && <Alert severity="success">{message}</Alert>}

                <Card variant="outlined">
                    <CardContent>
                        {registrations.length === 0 ? (
                            <Typography color="text.secondary">
                                You have no registrations yet.
                            </Typography>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Competition</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {registrations.map((r) => (
                                            <TableRow key={r.registrationId}>
                                                <TableCell>
                                                    {r.competitionName}
                                                </TableCell>
                                                <TableCell>{r.status}</TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={() =>
                                                            handleCancel(r)
                                                        }
                                                    >
                                                        Cancel
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
}

export default MyRegistrationsPage;
