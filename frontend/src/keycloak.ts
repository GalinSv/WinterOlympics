import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "http://localhost:8080",
    realm: "winter-olympics",
    clientId: "winter-frontend",
});

export default keycloak;
