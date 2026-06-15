const hasValue = (value) => value !== null && value !== undefined;

const getStatusValue = (dashboard, keys) => {
    for (const key of keys) {
        if (hasValue(dashboard?.[key])) {
            return dashboard[key];
        }
    }

    return undefined;
};

export const getAdminTeamCreationStatus = (dashboard = {}) => {
    const grade2Source =
        getStatusValue(dashboard, ["grade2TeamCreated", "grade2Created"]) ??
        dashboard.teamCreationStatus?.GRADE_2 ??
        dashboard.teamCreationStatus?.grade2 ??
        (hasValue(dashboard.grade2TeamCount)
            ? dashboard.grade2TeamCount > 0
            : undefined);

    const grade3Source =
        getStatusValue(dashboard, ["grade3TeamCreated", "grade3Created"]) ??
        dashboard.teamCreationStatus?.GRADE_3 ??
        dashboard.teamCreationStatus?.grade3 ??
        (hasValue(dashboard.grade3TeamCount)
            ? dashboard.grade3TeamCount > 0
            : undefined);

    const hasGradeStatus = hasValue(grade2Source) || hasValue(grade3Source);

    if (hasGradeStatus) {
        const grade2TeamCreated = Boolean(grade2Source);
        const grade3TeamCreated = Boolean(grade3Source);

        return {
            grade2TeamCreated,
            grade3TeamCreated,
            allTeamCreated: grade2TeamCreated && grade3TeamCreated,
        };
    }

    const legacyTeamCreated = Boolean(
        dashboard.teamCreated || dashboard.totalTeamCount > 0
    );

    return {
        grade2TeamCreated: legacyTeamCreated,
        grade3TeamCreated: legacyTeamCreated,
        allTeamCreated: legacyTeamCreated,
    };
};

export const getNextTeamCreateMessage = ({
    grade2TeamCreated,
    grade3TeamCreated,
}) => {
    if (!grade2TeamCreated && !grade3TeamCreated) return "";
    if (!grade2TeamCreated) return "2학년 팀 생성이 필요합니다";
    if (!grade3TeamCreated) return "3학년 팀 생성이 필요합니다";

    return "팀 별 정보를 조회할 수 있습니다.";
};

export const isGradeTeamCreated = (teamStatus, grade) => {
    if (grade === "GRADE_2") return teamStatus.grade2TeamCreated;
    if (grade === "GRADE_3") return teamStatus.grade3TeamCreated;

    return false;
};
