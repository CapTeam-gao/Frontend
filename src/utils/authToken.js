export const isValidAccessToken = (token) => {
    if (typeof token !== "string") return false;

    const trimmedToken = token.trim();

    if (!trimmedToken || trimmedToken === "null" || trimmedToken === "undefined") {
        return false;
    }

    return trimmedToken.split(".").length === 3;
};

export const getStoredAccessToken = () => {
    const token = localStorage.getItem("accessToken");

    return isValidAccessToken(token) ? token : null;
};

export const getAccessTokenPayload = (token) => {
    if (!isValidAccessToken(token)) return null;

    try {
        const base64Payload = token.split(".")[1];
        const normalizedPayload = base64Payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        const paddedPayload = normalizedPayload.padEnd(
            Math.ceil(normalizedPayload.length / 4) * 4,
            "="
        );

        return JSON.parse(atob(paddedPayload));
    } catch {
        return null;
    }
};

export const isAccessTokenExpiringSoon = (token, bufferSeconds = 30) => {
    const payload = getAccessTokenPayload(token);

    if (!payload?.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);

    return payload.exp - currentTime <= bufferSeconds;
};
