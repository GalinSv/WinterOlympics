import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import theme from "./theme";
import keycloak from "./keycloak";

keycloak
    .init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri:
            window.location.origin + "/silent-check-sso.html",
        pkceMethod: "S256",
    })
    .catch(() => undefined)
    .finally(() => {
        ReactDOM.createRoot(
            document.getElementById("root")!
        ).render(
            <React.StrictMode>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                    <ToastContainer
                        position="bottom-right"
                        autoClose={4000}
                        newestOnTop
                        theme="colored"
                    />
                </ThemeProvider>
            </React.StrictMode>
        );
    });
