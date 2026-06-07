export const PROJECT_PLAN_STORAGE_KEY = "capteam-project-plan";

export const emptyProjectPlan = {
    teamName: "",
    serviceName: "",
    serviceSummary: "",
    targetUser: "",
    coreFeatures: "",
    expectedEffect: "",
    savedAt: "",
};

export const loadProjectPlan = () => {
    if (typeof window === "undefined") return emptyProjectPlan;

    const savedPlan = localStorage.getItem(PROJECT_PLAN_STORAGE_KEY);

    if (!savedPlan) return emptyProjectPlan;

    try {
        return {
            ...emptyProjectPlan,
            ...JSON.parse(savedPlan),
        };
    } catch {
        return emptyProjectPlan;
    }
};

export const saveProjectPlan = (plan) => {
    const nextPlan = {
        ...plan,
        savedAt: new Date().toISOString(),
    };

    localStorage.setItem(PROJECT_PLAN_STORAGE_KEY, JSON.stringify(nextPlan));

    return nextPlan;
};
