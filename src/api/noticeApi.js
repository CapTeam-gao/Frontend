import api from "./api";

const makeAuthHeader = (token) => {
    return {
        Authorization: `Bearer ${token}`,
    };
};

export const requestDeleteNotice = async (noticeId, token) => {
    const response = await api.delete(`/api/notices/${noticeId}`, {
        headers: makeAuthHeader(token),
    });

    return response.data;
};
