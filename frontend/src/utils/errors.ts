import axios from "axios";

export function extractErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as unknown;
        if (typeof data === "string" && data.trim()) return data;
        if (data && typeof data === "object") {
            const obj = data as Record<string, unknown>;
            if (typeof obj.message === "string") return obj.message;
            const firstField = Object.values(obj).find(
                (v) => typeof v === "string"
            );
            if (typeof firstField === "string") return firstField;
        }
        if (error.message) return error.message;
    }
    return fallback;
}
