import api from "./api";

const makeAuthHeader = (token) => {
    return {
        Authorization: `Bearer ${token}`,
    };
};

const getResponseData = (response) => {
    return response.data.data ?? response.data;
};

export const requestNoticeList = async (token) => {
    const response = await api.get("/api/notices", {
        headers: makeAuthHeader(token),
    });

    return getResponseData(response) ?? [];
};

export const requestNoticeDetail = async (noticeId, token) => {
    const response = await api.get(`/api/notices/${noticeId}`, {
        headers: makeAuthHeader(token),
    });

    return getResponseData(response);
};

export const requestCreateNotice = async (noticeData, token) => {
    const response = await api.post("/api/admin/notices", noticeData, {
        headers: makeAuthHeader(token),
    });

    return getResponseData(response);
};

export const requestUpdateNotice = async (noticeId, noticeData, token) => {
    const response = await api.put(
        `/api/admin/notices/${noticeId}`,
        noticeData,
        {
            headers: makeAuthHeader(token),
        }
    );

    return getResponseData(response);
};

export const requestDeleteNotice = async (noticeId, token) => {
    const response = await api.delete(`/api/admin/notices/${noticeId}`, {
        headers: makeAuthHeader(token),
    });

    return getResponseData(response);
};
