import axiosInstance from "../api/axios";

import type { Athlete, ApiResponse } from "../types/api";

function unwrap<T>(payload: T | ApiResponse<T>): T {
    if (
        typeof payload === "object" &&
        payload !== null &&
        "data" in (payload as Record<string, unknown>)
    ) {
        return (payload as ApiResponse<T>).data;
    }
    return payload as T;
}

export async function createAthlete(athlete: Athlete) {
    const response = await axiosInstance.post<Athlete | ApiResponse<Athlete>>(
        "/athletes",
        athlete
    );
    return unwrap(response.data);
}

export async function getAllAthletes() {
    const response = await axiosInstance.get<Athlete[] | ApiResponse<Athlete[]>>(
        "/athletes"
    );
    return unwrap(response.data);
}

export async function getAthleteById(id: number) {
    const response = await axiosInstance.get<Athlete | ApiResponse<Athlete>>(
        `/athletes/${id}`
    );
    return unwrap(response.data);
}

export async function updateAthlete(id: number, athlete: Athlete) {
    const response = await axiosInstance.put<Athlete | ApiResponse<Athlete>>(
        `/athletes/${id}`,
        athlete
    );
    return unwrap(response.data);
}

export async function deleteAthlete(id: number) {
    await axiosInstance.delete(`/athletes/${id}`);
}

export async function getCurrentAthlete() {
    const response = await axiosInstance.get<Athlete | ApiResponse<Athlete>>(
        "/athletes/me"
    );
    return unwrap(response.data);
}

export async function searchAthletes(name: string) {
    const response = await axiosInstance.get<Athlete[] | ApiResponse<Athlete[]>>(
        `/athletes/search`, { params: { name } }
    );
    return unwrap(response.data);
}

export async function updateMyProfile(athlete: Athlete) {
    const response = await axiosInstance.put<Athlete | ApiResponse<Athlete>>(
        `/athletes/me`, athlete
    );
    return unwrap(response.data);
}
