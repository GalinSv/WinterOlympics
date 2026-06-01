import keycloak from "../keycloak";

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
