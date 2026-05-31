import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import DownhillSkiingIcon from "@mui/icons-material/DownhillSkiing";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import BarChartIcon from "@mui/icons-material/BarChart";

import { Link } from "react-router-dom";

const FEATURES = [
    {
        to: "/competitions/slalom",
        title: "Ski Slalom",
        text: "Two-run events with qualification and combined-time ranking.",
        icon: <DownhillSkiingIcon fontSize="large" color="primary" />,
    },
    {
        to: "/competitions/biathlon",
        title: "Biathlon",
        text: "Cross-country times with shooting penalties added on.",
        icon: <SportsScoreIcon fontSize="large" color="primary" />,
    },
    {
        to: "/rankings",
        title: "Rankings",
        text: "Final standings per competition, sorted by rank.",
        icon: <LeaderboardIcon fontSize="large" color="primary" />,
    },
    {
        to: "/statistics",
        title: "Statistics",
        text: "Medals by country, average age and medalist highlights.",
        icon: <BarChartIcon fontSize="large" color="primary" />,
    },
];

function HomePage() {
    return (
        <Box sx={{ display: "grid", gap: 4 }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 4, md: 6 },
                    borderRadius: 4,
                    color: "common.white",
                    background:
                        "linear-gradient(135deg, #0d47a1 0%, #1565c0 45%, #00838f 100%)",
                }}
            >
                <Stack spacing={3}>
                    <Box>
                        <Typography
                            component="h1"
                            variant="h3"
                            sx={{ fontWeight: 800, letterSpacing: "-1px" }}
                        >
                            Winter Olympics Management
                        </Typography>
                        <Typography
                            sx={{
                                mt: 2,
                                maxWidth: 720,
                                opacity: 0.9,
                                fontWeight: 400,
                            }}
                            variant="h6"
                        >
                            Register athletes, run slalom and biathlon
                            competitions, and publish live rankings, medals and
                            statistics — all in one place.
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
                            color="inherit"
                            size="large"
                            sx={{ color: "primary.dark", bgcolor: "common.white" }}
                        >
                            Browse competitions
                        </Button>
                        <Button
                            component={Link}
                            to="/rankings"
                            variant="outlined"
                            color="inherit"
                            size="large"
                        >
                            View rankings
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1fr 1fr",
                        md: "repeat(4, 1fr)",
                    },
                    gap: 2.5,
                }}
            >
                {FEATURES.map((feature) => (
                    <Card key={feature.to} sx={{ height: "100%" }}>
                        <CardActionArea
                            component={Link}
                            to={feature.to}
                            sx={{ height: "100%" }}
                        >
                            <CardContent>
                                <Stack spacing={1.5}>
                                    {feature.icon}
                                    <Typography variant="h6">
                                        {feature.title}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {feature.text}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}

export default HomePage;
