import Keycloak from "keycloak-js";

// Single Keycloak client for the SPA. Matches the `winter-frontend`
// public client in the `winter-olympics` realm.
const keycloak = new Keycloak({
    url: "http://localhost:8080",
    realm: "winter-olympics",
    clientId: "winter-frontend",
});

export default keycloak;
