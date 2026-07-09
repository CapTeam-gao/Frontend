import axios from "axios";
import { getStoredAccessToken } from "../utils/authToken";
import authStore from "../store/authStore";
import { getApiBaseUrl } from "./baseUrl";

// 서버 주소를 한 번만 설정해두는 axios 기본 파일
const api = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
});

const getAccessTokenFromResponse = (response) => {
    return response.data.accessToken;
};

let refreshPromise = null;
const AUTH_EXPIRED_STATUS_CODES = [401, 403];

const isLoggingOut = () => authStore.getState().isLoggingOut;

export const isAuthenticationExpiredError = (error) => {
    return AUTH_EXPIRED_STATUS_CODES.includes(error.response?.status);
};

const requestRefreshToken = () => {
    if (isLoggingOut()) {
        throw new Error("로그아웃 중에는 토큰을 재발급하지 않습니다.");
    }

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
    if (isLoggingOut()) {
        throw new Error("로그아웃 중에는 토큰을 재발급하지 않습니다.");
    }

    const response = await requestRefreshToken();
    const newAccessToken = getAccessTokenFromResponse(response);

    if (!newAccessToken) {
        throw new Error("새 accessToken이 응답에 없습니다.");
    }

    authStore.getState().setAccessToken(newAccessToken);

    return response.data;
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
            !originalRequest.skipAuthRedirect &&
            !isLoggingOut()
        ) {
            originalRequest._retry = true;

            try {
                const reissueData = await reissueAccessToken();
                const newAccessToken = reissueData.accessToken;

                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization = `Bearer ${newAccessToken.trim()}`;

                return api(originalRequest);
            } catch (refreshError) {
                if (isAuthenticationExpiredError(refreshError)) {
                    authStore.getState().setUnauthenticated();
                    refreshError.isAuthExpired = true;
                } else {
                    refreshError.isAuthRefreshFailed = true;
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
export default api;
