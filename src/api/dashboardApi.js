import api from "./api";
import { ACCESS_TOKEN_KEY } from "../store/authStore";

const makeAuthHeader = () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    return token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {};
};

export const requestAdminDashboard = async () => {
    const response = await api.get("/api/admin/dashboard", {
        headers: makeAuthHeader(),
    });

    return response.data.data;
};

export const requestUserDashboard = async () => {
    const response = await api.get("/api/user/dashboard", {
        headers: makeAuthHeader(),
    });

    return response.data.data;
};