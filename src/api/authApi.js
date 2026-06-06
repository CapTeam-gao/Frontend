import api from "./api";
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
    const response = await api.post("/api/auth/login", {
        userId,
        password,
    });

    return response.data;
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
