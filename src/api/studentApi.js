import api from "./api";

const getResponseData = (response) => response.data?.data ?? response.data;

export const requestAdminStudentList = async () => {
    const response = await api.get("/api/admin/students");

    return getResponseData(response);
};

export const requestAdminStudentDetail = async (userId) => {
    const response = await api.get(`/api/admin/students/${userId}`);

    return getResponseData(response);
};
