import axios from "axios";

// 서버 주소를 한 번만 설정해두는 axios 기본 파일
const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
});

api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);
export default api;
