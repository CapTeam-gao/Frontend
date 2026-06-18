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

export const formatLogDate = (date) => {
    if (!date) return "";

    return String(date).replaceAll("-", ".");
};
