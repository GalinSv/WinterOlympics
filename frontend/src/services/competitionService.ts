import axiosInstance from "../api/axios";

import type {
    ApiResponse,
    BiathlonCompetition,
    BiathlonCompetitionInput,
    SlalomCompetition,
    SlalomCompetitionInput,
} from "../types/api";

export async function getSlalomCompetitions() {
    const response = await axiosInstance.get<
        ApiResponse<Omit<SlalomCompetition, "sport">[]>
    >("/slalom-competitions");
    return response.data.data.map((c) => ({ ...c, sport: "slalom" as const }));
}

export async function getBiathlonCompetitions() {
    const response = await axiosInstance.get<
        ApiResponse<Omit<BiathlonCompetition, "sport">[]>
    >("/biathlon-competitions");
    return response.data.data.map((c) => ({ ...c, sport: "biathlon" as const }));
}

export async function getAllCompetitions() {
    const [slalom, biathlon] = await Promise.all([
        getSlalomCompetitions(),
        getBiathlonCompetitions(),
    ]);
    return [...slalom, ...biathlon].sort((a, b) =>
        a.date.localeCompare(b.date)
    );
}

export async function createSlalomCompetition(input: SlalomCompetitionInput) {
    const response = await axiosInstance.post<
        ApiResponse<Omit<SlalomCompetition, "sport">>
    >("/slalom-competitions", input);
    return { ...response.data.data, sport: "slalom" as const };
}

export async function updateSlalomCompetition(
    id: number,
    input: SlalomCompetitionInput
) {
    const response = await axiosInstance.put<
        ApiResponse<Omit<SlalomCompetition, "sport">>
    >(`/slalom-competitions/${id}`, input);
    return { ...response.data.data, sport: "slalom" as const };
}

export async function deleteSlalomCompetition(id: number) {
    await axiosInstance.delete(`/slalom-competitions/${id}`);
}

export async function createBiathlonCompetition(input: BiathlonCompetitionInput) {
    const response = await axiosInstance.post<
        ApiResponse<Omit<BiathlonCompetition, "sport">>
    >("/biathlon-competitions", input);
    return { ...response.data.data, sport: "biathlon" as const };
}

export async function updateBiathlonCompetition(
    id: number,
    input: BiathlonCompetitionInput
) {
    const response = await axiosInstance.put<
        ApiResponse<Omit<BiathlonCompetition, "sport">>
    >(`/biathlon-competitions/${id}`, input);
    return { ...response.data.data, sport: "biathlon" as const };
}

export async function deleteBiathlonCompetition(id: number) {
    await axiosInstance.delete(`/biathlon-competitions/${id}`);
}

export async function finalizeSlalomCompetition(id: number) {
    await axiosInstance.post(`/slalom-competitions/${id}/finalize`);
}

export async function finalizeBiathlonCompetition(id: number) {
    await axiosInstance.post(`/biathlon-competitions/${id}/finalize`);
}

export async function runSlalomDemo(id: number) {
    await axiosInstance.post(`/demo/slalom/${id}`);
}

export async function runBiathlonDemo(id: number) {
    await axiosInstance.post(`/demo/biathlon/${id}`);
}

export async function assignSlalomMedals(competitionId: number) {
    await axiosInstance.post(`/statistics/slalom-medals/${competitionId}`);
}

export async function assignBiathlonMedals(competitionId: number) {
    await axiosInstance.post(`/statistics/biathlon-medals/${competitionId}`);
}
