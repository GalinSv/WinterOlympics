export type ApiResponse<T> = {
    success: boolean;
    data: T;
    message: string;
};

export type Gender = "MALE" | "FEMALE";

export type SportType = "slalom" | "biathlon";

export type CompetitionStatus = "DRAFT" | "ACTIVE" | "FINISHED";

export const COUNTRIES = [
    "BULGARIA", "GERMANY", "FRANCE", "ITALY", "NORWAY", "SWEDEN",
    "AUSTRIA", "SWITZERLAND", "USA", "CANADA", "FINLAND", "POLAND",
    "CZECH_REPUBLIC"
] as const;

export type Country = typeof COUNTRIES[number];

export type Athlete = {
    id?: number;
    username?: string;
    name: string;
    email: string;
    phoneNumber: string;
    country: Country;
    gender: Gender;
    birthDate: string;
};

export type RegisterRequest = {
    username: string;
    password: string;
    confirmPassword: string;
    name: string;
    email: string;
    phoneNumber: string;
    country: Country;
    gender: Gender;
    birthDate: string;
};

export type RegisterResponse = {
    athleteId: number;
    userId: number;
    username: string;
    email: string;
};

export type CompetitionBase = {
    id: number;
    name: string;
    date: string;
    gender: Gender;
    minimumAge: number;
    status?: CompetitionStatus;
};

export type SlalomCompetition = CompetitionBase & {
    sport: "slalom";
    secondRunQualifiedCount: number;
};

export type BiathlonCompetition = CompetitionBase & {
    sport: "biathlon";
    lapCount: number;
    shootingRounds: number;
    penaltySeconds: number;
};

export type Competition = SlalomCompetition | BiathlonCompetition;

export type OlympicStatistics = {
    medalsByCountry: Record<string, number>;
    totalGold: number;
    totalSilver: number;
    totalBronze: number;
    averageAthleteAge: number;
    youngestMedalist: string | null;
    youngestMedalistAge: number | null;
    oldestMedalist: string | null;
    oldestMedalistAge: number | null;
};

export type ResultBase = {
    id: number;
    registrationId: number;
    athleteName?: string;
    country?: string;
    totalTime?: number;
    finalRank?: number;
    finished?: boolean;
};

export type SlalomResult = ResultBase & {
    firstRunTime?: number;
    secondRunTime?: number;
    qualifiedForSecondRun?: boolean;
    secondRunStartOrder?: number;
};

export type BiathlonResult = ResultBase & {
    skiingTime?: number;
    missedShots?: number;
    penaltySeconds?: number;
};

export type Registration = {
    registrationId: number;
    athleteId: number;
    athleteName: string;
    country: string;
    competitionId: number;
    competitionName: string;
    status: string;
};

export type SlalomCompetitionInput = {
    name: string;
    date: string;
    gender: Gender;
    minimumAge: number;
    secondRunQualifiedCount: number;
};

export type BiathlonCompetitionInput = {
    name: string;
    date: string;
    gender: Gender;
    minimumAge: number;
    lapCount: number;
    shootingRounds: number;
    penaltySeconds: number;
};
