import api from "./api";

const getResponseData = (response) => {
    return response.data.data ?? response.data;
};

export const requestNoticeList = async () => {
    const response = await api.get("/api/notices");

    return getResponseData(response) ?? [];
};

export const requestNoticeDetail = async (noticeId) => {
    const response = await api.get(`/api/notices/${noticeId}`);

    return getResponseData(response);
};

export const requestCreateNotice = async (noticeData) => {
    const response = await api.post("/api/admin/notices", noticeData);

    return getResponseData(response);
};

export const requestUpdateNotice = async (noticeId, noticeData) => {
    const response = await api.put(`/api/admin/notices/${noticeId}`, noticeData);

    return getResponseData(response);
};

export const requestDeleteNotice = async (noticeId) => {
    const response = await api.delete(`/api/admin/notices/${noticeId}`);

    return getResponseData(response);
};
