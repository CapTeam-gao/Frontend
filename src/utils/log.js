export const LOG_GRADE_OPTIONS = [
    {
        label: "2학년",
        value: "GRADE_2",
    },
    {
        label: "3학년",
        value: "GRADE_3",
    },
];

export const getLogGradeLabel = (grade) => {
    const gradeOption = LOG_GRADE_OPTIONS.find(
        (option) => option.value === grade
    );

    return gradeOption?.label ?? grade ?? "";
};

export const isSubmittedLog = (log) => {
    return log?.submitted === true || log?.status === "COMPLETED";
};

export const matchesLogStatus = (log, status) => {
    if (status === "all") return true;
    if (status === "submitted") return isSubmittedLog(log);
    if (status === "pending") return !isSubmittedLog(log);

    return true;
};

export const getLogTeamName = (log) => {
    return log?.projectTeamName || log?.teamName || "";
};

export const formatLogDate = (date) => {
    if (!date) return "";

    return String(date).replaceAll("-", ".");
};

export const leaderLogFields = [
    {
        name: "activityContent",
        label: "활동 내용",
        desc: "오늘 내가 맡아서 진행한 작업을 구체적으로 작성해주세요.",
        placeholder: "오늘 내가 맡아서 진행한 작업을 구체적으로 작성해주세요.",
    },
    {
        name: "todayActivityContent",
        label: "오늘 방과후 프로젝트 진행 상황",
        desc: "오늘 팀 전체가 진행한 내용을 자세히 작성해주세요. (팀장만 작성)",
        placeholder: "오늘 팀 전체가 진행한 내용을 자세히 작성해주세요.",
    },
    {
        name: "nextPlanContent",
        label: "다음 캡스톤 시간까지 진행할 내용",
        desc: "다음 캡스톤 시간 전까지 진행할 작업을 자세히 작성해주세요.",
        placeholder:
            "다음 캡스톤 시간 전까지 진행할 작업을 자세히 작성해주세요.",
    },
    {
        name: "reflectionContent",
        label: "오늘 프로젝트 수행 만족도 및 자기 반성",
        desc: "오늘 작업에서 잘된 점, 부족했던 점, 다음에 개선할 점을 작성해주세요.",
        placeholder:
            "오늘 작업에서 잘된 점, 부족했던 점, 다음에 개선할 점을 작성해주세요.",
    },
];

export const memberLogFields = leaderLogFields.filter(
    (field) => field.name !== "todayActivityContent"
);

export const getLogFields = (isLeader) =>
    isLeader ? leaderLogFields : memberLogFields;

export const getFilledFieldCount = (formData, fields) =>
    fields.filter((field) => (formData[field.name] ?? "").trim()).length;
