import { toast } from "react-toastify";

import { extractErrorMessage } from "./errors";

/**
 * Thin wrapper around react-toastify so every screen shows consistent
 * success / error / info notifications. Backend error messages are
 * surfaced through extractErrorMessage.
 */
export const notify = {
    success(message: string) {
        toast.success(message);
    },
    info(message: string) {
        toast.info(message);
    },
    error(error: unknown, fallback: string) {
        toast.error(extractErrorMessage(error, fallback));
    },
    message(message: string) {
        toast(message);
    },
};
