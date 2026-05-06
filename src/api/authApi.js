import api from "./api";

export const login = (studentId, password) => {
    return api.post("/api/auth/login", {
        studentId,
        password,
    });
};
