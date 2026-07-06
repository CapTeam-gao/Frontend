const API_ORIGIN = "https://api.capteam.n-e.kr";

export const getApiBaseUrl = () => {
    if (import.meta.env.PROD) {
        return "";
    }

    return import.meta.env.VITE_BASE_URL || "";
};

export const getAssetUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    return `${getApiBaseUrl()}${path}`;
};

export const getSocketBaseUrl = () => {
    if (import.meta.env.VITE_SOCKET_BASE_URL) {
        return import.meta.env.VITE_SOCKET_BASE_URL;
    }

    return import.meta.env.VITE_BASE_URL || API_ORIGIN;
};
