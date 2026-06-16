export const emptyProjectPlan = {
    projectId: null,
    teamName: "",
    serviceName: "",
    serviceSummary: "",
    coreFeatures: [
        {
            id: 1,
            value: "",
        },
    ],
};

export const parseMainFeatures = (mainFeatures) => {
    if (!mainFeatures) return [];

    if (Array.isArray(mainFeatures)) {
        return mainFeatures
            .map((feature) =>
                typeof feature === "string" ? feature.trim() : ""
            )
            .filter(Boolean);
    }

    return mainFeatures
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean);
};

export const normalizeProjectPlan = (data) => {
    const project = data ?? {};
    const parsedFeatures = parseMainFeatures(
        project.coreFeatures ?? project.mainFeatures
    );

    return {
        ...emptyProjectPlan,
        projectId: project.projectId ?? null,
        teamName: project.teamName ?? "",
        serviceName: project.serviceName ?? "",
        serviceSummary: project.serviceSummary ?? project.serviceIntro ?? "",
        coreFeatures:
            parsedFeatures.length > 0
                ? parsedFeatures.map((feature, index) => ({
                      id: index + 1,
                      value: feature,
                  }))
                : [{ id: 1, value: "" }],
    };
};

export const getMainFeaturesText = (coreFeatures) => {
    return coreFeatures
        .map((feature) => feature.value.trim())
        .filter(Boolean)
        .join("\n");
};

export const hasEmptyProjectPlanField = (projectPlan) => {
    const hasEmptyCoreFeature = projectPlan.coreFeatures.some(
        (feature) => !feature.value.trim()
    );

    return (
        !projectPlan.teamName.trim() ||
        !projectPlan.serviceName.trim() ||
        !projectPlan.serviceSummary.trim() ||
        hasEmptyCoreFeature
    );
};
