import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL } from "../config/api";
import {
    logout,
} from "../services/authService";
import { getAccessToken } from "../utils/jwt";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token =
            getAccessToken();

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {

        const originalRequest =
            error.config as
                | (InternalAxiosRequestConfig & {
                    _retry?: boolean;
                })
                | undefined;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            logout();
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
