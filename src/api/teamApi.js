import api from "./api";

const getResponseData = (response) => response.data?.data ?? response.data;

export const requestCreateTeamRecommendation = async (
    grade,
    regenerationPrompt = ""
) => {
    const response = await api.post("/api/admin/team-recommendations", {
        grade,
        regenerationPrompt: regenerationPrompt.trim() || null,
    });

    return getResponseData(response);
};

export const requestTeamRecommendationList = async () => {
    const response = await api.get("/api/admin/team-recommendations");

    return getResponseData(response);
};

export const requestTeamRecommendationsByGrade = async (grade) => {
    const response = await api.get(
        `/api/admin/team-recommendations/grade/${grade}`
    );

    return getResponseData(response);
};

export const requestTeamRecommendationDetail = async (recommendationId) => {
    const response = await api.get(
        `/api/admin/team-recommendations/${recommendationId}`
    );

    return getResponseData(response);
};

export const requestSwapTeamMembers = async (
    fromRecommendationId,
    fromUserId,
    toRecommendationId,
    toUserId
) => {
    const response = await api.post("/api/admin/team-recommendations/swap", {
        fromRecommendationId,
        fromUserId,
        toRecommendationId,
        toUserId,
    });

    return getResponseData(response);
};

export const requestAcceptTeamRecommendation = async (recommendationId) => {
    const response = await api.post(
        `/api/admin/team-recommendations/${recommendationId}/accept`
    );

    return getResponseData(response);
};

export const requestAcceptAllTeamRecommendations = async (grade) => {
    const response = await api.post(
        `/api/admin/team-recommendations/accept-all/${grade}`
    );

    return getResponseData(response);
};

export const requestAdminTeamList = async () => {
    const response = await api.get("/api/admin/teams");

    return getResponseData(response);
};

export const requestAdminTeamDetail = async (teamId) => {
    const response = await api.get(`/api/admin/teams/${teamId}`);

    return getResponseData(response);
};

export const requestMyTeam = async () => {
    const response = await api.get("/api/teams/my-team");

    return getResponseData(response);
};
