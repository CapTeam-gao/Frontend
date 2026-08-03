import api from "./api";

export const requestRegisterFcmToken = async (fcmToken) => {
    const response = await api.post("/api/user/fcm-token", { fcmToken });

    return response.data?.data;
};

export const requestRemoveFcmToken = async () => {
    const response = await api.delete("/api/user/fcm-token");

    return response.data?.data;
};
