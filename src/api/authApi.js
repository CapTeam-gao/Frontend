import api, { reissueAccessToken } from "./api";
import { isValidAccessToken } from "../utils/authToken";

const makeAuthHeader = (token) => {
    if (!isValidAccessToken(token)) {
        return {};
    }

    return {
        Authorization: `Bearer ${token.trim()}`,
    };
};

export const requestLogin = async (userId, password) => {
    const response = await api.post(
        "/api/auth/login",
        {
            userId,
            password,
        },
        {
            skipAuthRedirect: true,
            skipAuthHeader: true,
        }
    );

    return response.data;
};

export const requestReissue = async () => {
    return reissueAccessToken();
};

export const requestMyInfo = async (token) => {
    if (!isValidAccessToken(token)) {
        throw new Error("유효하지 않은 로그인 토큰입니다.");
    }

    const response = await api.get("/api/user/header", {
        // JWT는 요청할 때마다 토큰을 직접 같이 보냄
        headers: makeAuthHeader(token),
    });

    return response.data;
};

export const requestChangePassword = async ({
    password,
    newPassword,
    checkPassword,
}) => {
    const response = await api.put(
        "/api/auth/password",
        {
            password,
            newPassword,
            checkPassword,
        }
    );

    return response.data;
};

export const requestLogout = async () => {
    const response = await api.post(
        "/api/auth/logout",
        {},
        {
            skipAuthRedirect: true,
            skipAuthHeader: true,
        }
    );

    return response.data;
};

export const getAccessTokenPayload = (token) => {
    if (!isValidAccessToken(token)) return null;

    try {
        const payload = token.split(".")[1];
        const decodedPayload = atob(
            payload.replace(/-/g, "+").replace(/_/g, "/")
        );

        return JSON.parse(decodedPayload);
    } catch {
        return null;
    }
};

export const isAccessTokenExpiringSoon = (token, bufferSeconds = 30) => {
    const payload = getAccessTokenPayload(token);

    if (!payload?.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    const expireTime = payload.exp;

    return expireTime - currentTime <= bufferSeconds;
};
