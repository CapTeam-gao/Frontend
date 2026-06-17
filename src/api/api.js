import axios from "axios";
import { getStoredAccessToken } from "../utils/authToken";

// 서버 주소를 한 번만 설정해두는 axios 기본 파일
const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    if (config.skipAuthHeader) {
        return config;
    }

    const accessToken = getStoredAccessToken();

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
        localStorage.removeItem("accessToken");
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.skipAuthRedirect
        ) {
            originalRequest._retry = true;

            try {
                const response = await api.post(
                    "/api/auth/reissue",
                    {},
                    {
                        skipAuthRedirect: true,
                        skipAuthHeader: true,
                    }
                );

                const newAccessToken =
                    response.data?.accessToken ?? response.data?.data?.accessToken;

                if (!newAccessToken) {
                    throw new Error("새 accessToken이 응답에 없습니다.");
                }

                localStorage.setItem("accessToken", newAccessToken.trim());

                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization = `Bearer ${newAccessToken.trim()}`;

                return api(originalRequest);
            } catch {
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);
export default api;
