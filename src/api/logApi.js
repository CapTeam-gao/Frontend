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

// month: "yyyy-MM" (생략하면 서버가 오늘이 속한 달을 내려줌)
export const requestAdminJournalCalendar = async (month) => {
    const response = await api.get("/api/admin/journals/calendar", {
        params: month ? { month } : undefined,
    });

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
