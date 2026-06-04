import api from "./api";

export const requestAdminDashboard = async () => {
    const response = await api.get("/api/admin/dashboard");

    return response.data.data;
};

export const requestUserDashboard = async () => {
    const response = await api.get("/api/user/dashboard");

    return response.data.data;
};
