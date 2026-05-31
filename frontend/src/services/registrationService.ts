import axiosInstance from "../api/axios";

import type { ApiResponse, Registration } from "../types/api";

export async function registerForCompetition(
    athleteId: number,
    competitionId: number
) {
    await axiosInstance.post("/registrations", { athleteId, competitionId });
}

export async function getRegistrationsByCompetition(competitionId: number) {
    const response = await axiosInstance.get<ApiResponse<Registration[]>>(
        `/registrations/competition/${competitionId}`
    );
    return response.data.data;
}

export async function getRegistrationsByAthlete(athleteId: number) {
    const response = await axiosInstance.get<ApiResponse<Registration[]>>(
        `/registrations/athlete/${athleteId}`
    );
    return response.data.data;
}

export async function cancelRegistration(registrationId: number) {
    await axiosInstance.delete(`/registrations/${registrationId}`);
}

export async function fillRandomAthletes(competitionId: number, count = 16) {
    await axiosInstance.post(`/registrations/fill/${competitionId}`, null, {
        params: { count },
    });
}
