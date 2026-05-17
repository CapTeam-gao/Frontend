import axios from "axios";
import authStore from "../store/authStore";

// axios 이용
const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true,
});

// 인터셉터를 통해 미리 오류를 낚아챔
// 만약 response 값이 제대로 되있다면 그대로 반환
// 오류인데 오류 중 status가 401이면 로그인 페이지로 이동
// 마지막으로 오류 발생 곳에다가 오류 전달해줌(Promise.reject)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            const { clearUser } = authStore.getState();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
