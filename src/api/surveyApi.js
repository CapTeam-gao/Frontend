import api from "./api";

const getResponseData = (response) => response.data.data;

export const requestSubmitSurvey = async (surveyData) => {
    const response = await api.post("/api/user/survey", surveyData);

    return getResponseData(response);
};

export const requestMySurvey = async () => {
    const response = await api.get("/api/user/survey");

    return getResponseData(response);
};

export const requestSurveyReminder = async (grade) => {
    const response = await api.post(
        "/api/admin/notifications/survey-reminder",
        { grade }
    );

    return getResponseData(response);
};
