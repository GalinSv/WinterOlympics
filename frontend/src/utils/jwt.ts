import keycloak from "../keycloak";

export function getAccessToken() {
    return keycloak.token ?? null;
}

export function isAuthenticated() {
    return Boolean(keycloak.authenticated);
}

export function hasRole(role: string) {
    return keycloak.tokenParsed?.realm_access?.roles?.includes(role) ?? false;
}
