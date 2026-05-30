import axiosInstance from "../api/axios";

import type {
    ApiResponse,
    OlympicStatistics,
} from "../types/api";

export async function getOlympicStatistics() {

    const response =
        await axiosInstance.get<
            ApiResponse<OlympicStatistics>
        >("/statistics");

    return response.data.data;
}
