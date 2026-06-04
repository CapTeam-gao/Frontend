import api from "./api";

const makeAuthHeader = (token) => ({
    Authorization: `Bearer ${token}`,
});

export const requestAdminDashboard = async (token) => {
    const response = await api.get("/api/admin/dashboard", {
        headers: makeAuthHeader(token),
    });

    return response.data.data;
};

export const requestUserDashboard = async (token) => {
    const response = await api.get("/api/user/dashboard", {
        headers: makeAuthHeader(token),
    });

    return response.data.data;
};
