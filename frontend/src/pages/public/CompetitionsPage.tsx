import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Typography,
} from "@mui/material";

import { Link } from "react-router-dom";

function CompetitionsPage() {
    return (
        <Box>
            <Typography
                component="h1"
                variant="h4"
                sx={{ mb: 3, fontWeight: 700 }}
            >
                Competitions
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 2,
                }}
            >
                <Card variant="outlined">
                    <CardContent>
                        <Typography
                            component="h2"
                            variant="h6"
                        >
                            Ski Slalom
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Two-run competitions with qualification for the
                            second run and final ranking by total time.
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button
                            component={Link}
                            to="/competitions/slalom"
                        >
                            Open slalom
                        </Button>
                    </CardActions>
                </Card>

                <Card variant="outlined">
                    <CardContent>
                        <Typography
                            component="h2"
                            variant="h6"
                        >
                            Biathlon
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Skiing time, shooting misses, penalties, and final
                            ranking by adjusted total time.
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button
                            component={Link}
                            to="/competitions/biathlon"
                        >
                            Open biathlon
                        </Button>
                    </CardActions>
                </Card>
            </Box>
        </Box>
    );
}

export default CompetitionsPage;
