import axios from "axios";

import { API_BASE_URL } from "../config/api";
import keycloak from "../keycloak";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(async (config) => {
    if (keycloak.authenticated) {
        try {
            // Refresh the access token if it expires within 30 seconds.
            await keycloak.updateToken(30);
        } catch {
            keycloak.login();
        }
        if (keycloak.token) {
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            keycloak.login();
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
