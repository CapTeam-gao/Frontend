import api from "./api";

const getResponseData = (response) => response.data?.data ?? response.data;

export const requestUserProjectPlan = async () => {
    const response = await api.get("/api/teams/project");

    return getResponseData(response);
};

export const requestSaveUserProjectPlan = async (projectPlan) => {
    const response = await api.put("/api/teams/project", {
        teamName: projectPlan.teamName,
        serviceName: projectPlan.serviceName,
        serviceIntro: projectPlan.serviceSummary,
        mainFeatures: projectPlan.coreFeatures,
    });

    return getResponseData(response);
};
