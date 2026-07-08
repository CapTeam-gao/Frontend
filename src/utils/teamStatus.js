export const HACKATHON_TARGET_GRADE = "GRADE_2";
export const HACKATHON_TARGET_GRADE_LABEL = "2학년";
export const IS_HACKATHON_GRADE_ONLY_MODE = true;

export const getAdminTeamCreationStatus = (dashboard = {}) => {
    const grade2TeamCreated = Boolean(dashboard.grade2TeamCreated);
    const grade3TeamCreated = Boolean(dashboard.grade3TeamCreated);
    const hackathonTargetTeamCreated = grade2TeamCreated;

    return {
        grade2TeamCreated,
        grade3TeamCreated,
        anyTeamCreated: grade2TeamCreated || grade3TeamCreated,
        allTeamCreated: grade2TeamCreated && grade3TeamCreated,
        hackathonTargetTeamCreated,
        teamManageAccessible: IS_HACKATHON_GRADE_ONLY_MODE
            ? hackathonTargetTeamCreated
            : grade2TeamCreated && grade3TeamCreated,
    };
};

export const getNextTeamCreateMessage = ({
    grade2TeamCreated,
    grade3TeamCreated,
}) => {
    if (!grade2TeamCreated && !grade3TeamCreated) return "";
    if (!grade2TeamCreated) return "2학년 팀 생성이 필요합니다";
    if (IS_HACKATHON_GRADE_ONLY_MODE) {
        return "2학년 해커톤 팀 관리가 가능합니다";
    }
    if (!grade3TeamCreated) return "3학년 팀 생성이 필요합니다";

    return "팀 별 정보를 조회할 수 있습니다.";
};

export const isGradeTeamCreated = (teamStatus, grade) => {
    if (grade === "GRADE_2") return teamStatus.grade2TeamCreated;
    if (grade === "GRADE_3") return teamStatus.grade3TeamCreated;

    return false;
};
