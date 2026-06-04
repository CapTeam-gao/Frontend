import api from "./api";

export const requestAdminStudentList = async () => {
    const response = await api.get("/api/admin/students");

    return response.data;
};

export const requestAdminStudentDetail = async (userId) => {
    const response = await api.get(`/api/admin/students/${userId}`);

    return response.data;
};
