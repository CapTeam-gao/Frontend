import api from "./api";

const getResponseData = (response) => response.data?.data ?? response.data;

export const requestSubmitSurvey = async (surveyData) => {
    const response = await api.post("/api/user/survey", surveyData);

    return getResponseData(response);
};

export const requestMySurvey = async () => {
    const response = await api.get("/api/user/survey");

    return getResponseData(response);
};
