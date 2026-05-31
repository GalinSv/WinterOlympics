import keycloak from "../keycloak";

// Authentication is delegated to Keycloak (OAuth2 / OpenID Connect).
// After login/registration, return to the app root (not /login) so the
// auth pages don't re-trigger another redirect.
const HOME = window.location.origin + "/";

export function login() {
    return keycloak.login({ redirectUri: HOME });
}

export function register() {
    return keycloak.register({ redirectUri: HOME });
}

export function logout() {
    return keycloak.logout({ redirectUri: window.location.origin });
}
