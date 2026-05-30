import axios from "axios";

import { API_BASE_URL } from "../config/api";

import type { TokenResponse } from "../types/auth";
import type {
    ApiResponse,
    RegisterRequest,
    RegisterResponse,
} from "../types/api";

const ACCESS_TOKEN_KEY =
    "access_token";

function storeToken(data: TokenResponse) {

    const token =
        data.access_token || data.accessToken;

    if (token) {
        localStorage.setItem(
            ACCESS_TOKEN_KEY,
            token
        );
    }
}

export async function login(
    username: string,
    password: string
) {

    const response =
        await axios.post<
            ApiResponse<TokenResponse>
        >(
            `${API_BASE_URL}/auth/login`,
            {
                username,
                password,
            }
        );

    const data =
        response.data.data;

    storeToken(data);

    return data;
}

export async function refreshAccessToken() {
    throw new Error("Refresh tokens are not used");
}

export function logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function registerAthleteAccount(
    request: RegisterRequest
) {

    const response =
        await axios.post<
            ApiResponse<RegisterResponse>
        >(
            `${API_BASE_URL}/auth/register`,
            request
        );

    return response.data.data;
}
