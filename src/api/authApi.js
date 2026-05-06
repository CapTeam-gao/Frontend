import api from "./instance";

export const login = (studentId, password) => {
    return api.post("/api/auth/login", {
        studentId,
        password,
    });
};

export const getMe = () => {
    return api.get("/api/auth/me");
};
