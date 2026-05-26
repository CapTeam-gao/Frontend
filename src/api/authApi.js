import api from "./api";

const makeAuthHeader = (token) => {
    return {
        Authorization: `Bearer ${token}`,
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
    const response = await api.get("/api/user/header", {
        // JWT는 요청할 때마다 토큰을 직접 같이 보냄
        headers: makeAuthHeader(token),
    });

    return response.data;
};
