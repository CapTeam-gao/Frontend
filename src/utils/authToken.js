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
