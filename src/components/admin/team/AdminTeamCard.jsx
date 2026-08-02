import { gradeLabels } from "../../../constants/team";
import {
    getTeamDisplayName,
    getRoleCountSummary,
    hasProjectInfo,
} from "../../../utils/teamRecommendation";
import styles from "./AdminTeamCard.module.css";

const AdminTeamCard = ({ team, onClick }) => {
    const projectWritten = hasProjectInfo(team);
    const displayTeamName = getTeamDisplayName(team, projectWritten);
    const memberCount = team.members?.length ?? 0;

    return (
        <button
            type="button"
            className={`${styles.teamCard} ${
                projectWritten ? styles.written : ""
            }`}
            onClick={onClick}
        >
            <div className={styles.titleRow}>
                <span className={styles.teamName}>{displayTeamName}</span>
                <span className={styles.teamGrade}>
                    {gradeLabels[team.grade] || team.grade}
                </span>
                <span
                    className={`${styles.teamStatus} ${
                        projectWritten ? styles.done : styles.pending
                    }`}
                >
                    {projectWritten ? "기획서 작성 완료" : "기획서 작성 전"}
                </span>
            </div>

            <p className={styles.roleSummary}>
                {getRoleCountSummary(team.roleCount)}
            </p>

            <div className={styles.cardBody}>
                {projectWritten ? (
                    <div className={styles.serviceRow}>
                        <span>서비스명</span>
                        <strong>{team.serviceName}</strong>
                    </div>
                ) : (
                    <p className={styles.emptyProject}>
                        프로젝트 기획서가 아직 작성되지 않았습니다.
                    </p>
                )}
            </div>

            <div className={styles.cardFooter}>
                팀원 {memberCount}명 · 클릭하여 상세 확인
            </div>
        </button>
    );
};

export default AdminTeamCard;
