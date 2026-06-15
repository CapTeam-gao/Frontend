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

export const normalizeProjectPlan = (data) => {
    const parseCoreFeatures = (mainFeatures) => {
        if (!mainFeatures) {
            return [{ id: 1, value: "" }];
        }

        return mainFeatures.split("\n").map((feature, index) => ({
            id: index + 1,
            value: feature,
        }));
    };
    const project = data ?? {};

    return {
        ...emptyProjectPlan,
        projectId: project.projectId ?? null,
        teamName: project.teamName ?? "",
        serviceName: project.serviceName ?? "",
        serviceSummary: project.serviceSummary ?? project.serviceIntro ?? "",
        coreFeatures: parseCoreFeatures(
            project.coreFeatures ?? project.mainFeatures
        ),
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
