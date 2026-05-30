import {
    Box,
    Button,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import { Link } from "react-router-dom";

function HomePage() {
    return (
        <Box
            sx={{
                display: "grid",
                gap: 3,
                maxWidth: 980,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, md: 5 },
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                }}
            >
                <Stack spacing={3}>
                    <Box>
                        <Typography
                            component="h1"
                            variant="h3"
                            sx={{ fontWeight: 700 }}
                        >
                            Winter Olympics Management
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 1.5,
                                maxWidth: 720,
                            }}
                        >
                            Public competition data, rankings, medals,
                            and statistics for slalom and biathlon events.
                        </Typography>
                    </Box>

                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                    >
                        <Button
                            component={Link}
                            to="/competitions/slalom"
                            variant="contained"
                        >
                            Slalom
                        </Button>

                        <Button
                            component={Link}
                            to="/competitions/biathlon"
                            variant="outlined"
                        >
                            Biathlon
                        </Button>

                        <Button
                            component={Link}
                            to="/rankings"
                            variant="outlined"
                        >
                            Rankings
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
}

export default HomePage;
