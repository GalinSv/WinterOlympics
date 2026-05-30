import type { JSX } from "react";
import { Navigate } from "react-router-dom";

import {
    hasRole,
    isAuthenticated,
} from "../utils/jwt";

type Props = {
    children: JSX.Element;

    requiredRole?: string;
};

function ProtectedRoute({
    children,
    requiredRole,
}: Props) {

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (
        requiredRole &&
        !hasRole(requiredRole)
    ) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
