import axios from "axios";
import { getStoredAccessToken } from "../utils/authToken";
import authStore from "../store/authStore";

// 서버 주소를 한 번만 설정해두는 axios 기본 파일
const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true,
});

const getAccessTokenFromResponse = (response) => {
    return response.data?.accessToken ?? response.data?.data?.accessToken;
};

let refreshPromise = null;

const requestRefreshToken = () => {
    if (!refreshPromise) {
        refreshPromise = api
            .post(
                "/api/auth/reissue",
                {},
                {
                    skipAuthRedirect: true,
                    skipAuthHeader: true,
                }
            )
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

export const reissueAccessToken = async () => {
    const response = await requestRefreshToken();
    const newAccessToken = getAccessTokenFromResponse(response);

    if (!newAccessToken) {
        throw new Error("새 accessToken이 응답에 없습니다.");
    }

    authStore.getState().setAccessToken(newAccessToken);

    return response.data?.data ?? response.data;
};

api.interceptors.request.use((config) => {
    if (config.skipAuthHeader) {
        return config;
    }

    if (config.headers?.Authorization) {
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
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.skipAuthRedirect
        ) {
            originalRequest._retry = true;

            try {
                const reissueData = await reissueAccessToken();
                const newAccessToken = reissueData.accessToken;

                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization = `Bearer ${newAccessToken.trim()}`;

                return api(originalRequest);
            } catch {
                authStore.getState().setUnauthenticated();
                error.isAuthExpired = true;
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);
export default api;
