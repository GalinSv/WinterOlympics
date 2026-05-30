import { getSlalomCompetitions } from "../../services/competitionService";

import type { SlalomCompetition } from "../../types/api";

import SportCompetitionsPage from "./SportCompetitionsPage";

function SlalomCompetitionsPage() {
    return (
        <SportCompetitionsPage<SlalomCompetition>
            title="Ski Slalom Competitions"
            description="Browse men and women slalom competitions, including second-run qualification limits."
            emptyMessage="No slalom competitions match this filter."
            chipColor="primary"
            loadCompetitions={getSlalomCompetitions}
            renderDetails={(competition) =>
                `Second run qualifiers: ${competition.secondRunQualifiedCount}`
            }
        />
    );
}

export default SlalomCompetitionsPage;
