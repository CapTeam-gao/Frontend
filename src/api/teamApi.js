import api from "./api";

const getResponseData = (response) => response.data.data;

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

export const requestStartTeamMatchingJob = async (
    grade,
    regenerationPrompt = "",
    baseVersionId = null
) => {
    const response = await api.post("/api/admin/team-recommendations/matching/run", {
        grade,
        regenerationPrompt: regenerationPrompt.trim() || null,
        baseVersionId: baseVersionId || null,
    });

    return getResponseData(response);
};

export const requestTeamMatchingVersionDetail = async (versionId) => {
    const response = await api.get(
        `/api/admin/team-recommendations/versions/${versionId}`
    );

    return getResponseData(response);
};

export const requestLatestTeamMatchingVersion = async (grade) => {
    const response = await api.get(
        `/api/admin/team-recommendations/versions/grade/${grade}/latest`
    );

    return getResponseData(response);
};

export const requestTeamMatchingVersionDiff = async (
    fromVersionId,
    toVersionId
) => {
    const response = await api.get(
        "/api/admin/team-recommendations/versions/diff",
        { params: { fromVersionId, toVersionId } }
    );

    return getResponseData(response);
};

export const requestApplyTeamMatchingVersion = async (versionId) => {
    const response = await api.post(
        `/api/admin/team-recommendations/versions/${versionId}/apply`
    );

    return getResponseData(response);
};

export const requestDiscardTeamMatchingVersion = async (versionId) => {
    const response = await api.post(
        `/api/admin/team-recommendations/versions/${versionId}/discard`
    );

    return getResponseData(response);
};

export const requestTeamMatchingJob = async (jobId) => {
    const response = await api.get(
        `/api/admin/team-recommendations/matching/jobs/${jobId}`
    );

    return getResponseData(response);
};

export const requestCancelTeamMatchingJob = async (jobId) => {
    const response = await api.delete(
        `/api/admin/team-recommendations/matching/jobs/${jobId}`
    );

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

    return response.data;
};

export const requestAdminTeamDetail = async (teamId) => {
    const response = await api.get(`/api/admin/teams/${teamId}`);

    return getResponseData(response);
};

export const requestMyTeam = async () => {
    const response = await api.get("/api/teams/my-team");

    return getResponseData(response);
};

export const requestCreateManualTeams = async (grade, teams) => {
    const response = await api.post("/api/admin/teams/manual", {
        grade,
        teams,
    });

    return getResponseData(response);
};
