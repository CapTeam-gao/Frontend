import api from "./api";

const makeAuthHeader = (token) => ({
    Authorization: `Bearer ${token}`,
});

export const requestAdminStudentList = async (token) => {
    const response = await api.get("/api/admin/students", {
        headers: makeAuthHeader(token),
    });

    return response.data;
};

export const requestAdminStudentDetail = async (userId, token) => {
    const response = await api.get(`/api/admin/students/${userId}`, {
        headers: makeAuthHeader(token),
    });

    return response.data;
};
