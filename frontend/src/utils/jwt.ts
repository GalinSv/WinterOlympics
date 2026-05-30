import { jwtDecode } from "jwt-decode";

import type { JwtPayload } from "../types/auth";

export function getAccessToken() {
    return localStorage.getItem("access_token");
}

export function getDecodedToken() {

    const token =
        getAccessToken();

    if (!token) {
        return null;
    }

    try {
        return jwtDecode<JwtPayload>(token);
    } catch {
        return null;
    }
}

export function isTokenExpired() {

    const decoded =
        getDecodedToken();

    if (!decoded?.exp) {
        return true;
    }

    return decoded.exp * 1000 <= Date.now();
}

export function isAuthenticated() {
    return Boolean(getAccessToken()) && !isTokenExpired();
}

export function hasRole(role: string) {

    const decoded =
        getDecodedToken();

    if (!decoded) {
        return false;
    }

    return (
        decoded.roles?.includes(role)
        ?? false
    );
}
