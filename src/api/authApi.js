import api from "./instance";

export const login = (studentId, password) => {
    return api.post("/api/auth/login", {
        // studentId와 password를 서버한테 저장해달라고 요청함
        studentId,
        password,
    });
};

export const getMe = () => {
    return api.get("/api/auth/me"); // 지금 로그인이 되있는 상태인지 서버한테 보내달라고 요청함, user 정보가 올 수도 있고 401이 올 수도 있음
};
