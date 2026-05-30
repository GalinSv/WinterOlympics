import { getBiathlonCompetitions } from "../../services/competitionService";

import type { BiathlonCompetition } from "../../types/api";

import SportCompetitionsPage from "./SportCompetitionsPage";

function BiathlonCompetitionsPage() {
    return (
        <SportCompetitionsPage<BiathlonCompetition>
            title="Biathlon Competitions"
            description="Browse men and women biathlon competitions, including laps, shooting rounds, and penalties."
            emptyMessage="No biathlon competitions match this filter."
            chipColor="success"
            loadCompetitions={getBiathlonCompetitions}
            renderDetails={(competition) =>
                `${competition.lapCount} laps, ${competition.shootingRounds} shooting rounds, ${competition.penaltySeconds}s penalty per miss`
            }
        />
    );
}

export default BiathlonCompetitionsPage;
