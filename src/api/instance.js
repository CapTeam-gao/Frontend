import axios from "axios";
import authStore from "../store/authStore";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true,
});

instance.interceptors.response.use(
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

export default instance;
