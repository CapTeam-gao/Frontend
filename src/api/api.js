import axios from "axios";

// 서버 주소를 한 번만 설정해두는 axios 기본 파일
const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
});

export default api;
