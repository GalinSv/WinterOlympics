import axiosInstance from "../api/axios";

import type {
    ApiResponse,
    BiathlonResult,
    SlalomResult,
} from "../types/api";

export async function getSlalomResults(competitionId: number) {
    const response = await axiosInstance.get<ApiResponse<SlalomResult[]>>(
        `/slalom-results/${competitionId}`
    );
    return response.data.data;
}

export async function generateSlalomDemoResults(competitionId: number) {
    const response = await axiosInstance.post<ApiResponse<SlalomResult[]>>(
        `/slalom-results/demo/${competitionId}`
    );
    return response.data.data;
}

export async function saveSlalomFirstRun(
    registrationId: number,
    firstRunTime: number,
    finished: boolean
) {
    const response = await axiosInstance.post<ApiResponse<SlalomResult>>(
        "/slalom-results/first-run",
        null,
        { params: { registrationId, firstRunTime, finished } }
    );
    return response.data.data;
}

export async function calculateSlalomQualifications(competitionId: number) {
    const response = await axiosInstance.post<ApiResponse<SlalomResult[]>>(
        `/slalom-results/qualifications/${competitionId}`
    );
    return response.data.data;
}

export async function saveSlalomSecondRun(
    registrationId: number,
    secondRunTime: number,
    finished: boolean
) {
    const response = await axiosInstance.post<ApiResponse<SlalomResult>>(
        "/slalom-results/second-run",
        null,
        { params: { registrationId, secondRunTime, finished } }
    );
    return response.data.data;
}

export async function calculateSlalomRanking(competitionId: number) {
    const response = await axiosInstance.post<ApiResponse<SlalomResult[]>>(
        `/slalom-results/ranking/${competitionId}`
    );
    return response.data.data;
}

export async function getBiathlonResults(competitionId: number) {
    const response = await axiosInstance.get<ApiResponse<BiathlonResult[]>>(
        `/biathlon-results/${competitionId}`
    );
    return response.data.data;
}

export async function generateBiathlonDemoResults(competitionId: number) {
    const response = await axiosInstance.post<ApiResponse<BiathlonResult[]>>(
        `/biathlon-results/demo/${competitionId}`
    );
    return response.data.data;
}

export async function saveBiathlonResult(
    registrationId: number,
    skiingTime: number,
    missedShots: number,
    finished: boolean
) {
    const response = await axiosInstance.post<ApiResponse<BiathlonResult>>(
        "/biathlon-results",
        null,
        { params: { registrationId, skiingTime, missedShots, finished } }
    );
    return response.data.data;
}

export async function calculateBiathlonRanking(competitionId: number) {
    const response = await axiosInstance.post<ApiResponse<BiathlonResult[]>>(
        `/biathlon-results/ranking/${competitionId}`
    );
    return response.data.data;
}
