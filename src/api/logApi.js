import api from "./api";

const getResponseData = (response) => response.data.data;

export const requestAdminLogList = async () => {
    const response = await api.get("/api/admin/journals");

    return getResponseData(response);
};

export const requestAdminLogDetail = async (journalId) => {
    const response = await api.get(`/api/admin/journals/${journalId}`);

    return getResponseData(response);
};

export const requestUserLogDetail = async (journalId) => {
    const response = await api.get(`/api/journals/${journalId}`);

    return getResponseData(response);
};

export const requestUserLogList = async () => {
    const response = await api.get("/api/journals");
    return getResponseData(response);
};

export const requestCreateUserLog = async (logData) => {
    const response = await api.post("/api/journals", {
        activityContent: logData.activityContent,
        todayActivityContent: logData.todayActivityContent,
        nextPlanContent: logData.nextPlanContent,
        reflectionContent: logData.reflectionContent,
    });

    return getResponseData(response);
};

export const requestUpdateUserLog = async (journalId, logData) => {
    const response = await api.patch(`/api/journals/${journalId}`, {
        activityContent: logData.activityContent,
        todayActivityContent: logData.todayActivityContent,
        nextPlanContent: logData.nextPlanContent,
        reflectionContent: logData.reflectionContent,
    });

    return getResponseData(response);
};
