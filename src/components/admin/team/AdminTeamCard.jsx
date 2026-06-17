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

    return (
        <button
            type="button"
            className={`${styles.teamCard} ${
                projectWritten ? styles.writtenCard : ""
            }`}
            onClick={onClick}
        >
            <header className={styles.teamHeader}>
                <div className={styles.teamTitleGroup}>
                    <h2>{displayTeamName}</h2>
                    <span>{gradeLabels[team.grade] || team.grade}</span>
                </div>
                <p className={styles.roleSummary}>
                    {getRoleCountSummary(team.roleCount)}
                </p>
            </header>

            {projectWritten ? (
                <section className={styles.projectSummary}>
                    <span>프로젝트 기획서</span>
                    <strong>{team.serviceName}</strong>
                    <p>클릭하여 팀 상세 정보와 팀원 구성을 확인할 수 있습니다.</p>
                </section>
            ) : (
                <div className={styles.emptyProject}>
                    정보가 입력되지 않았습니다.
                </div>
            )}
        </button>
    );
};

export default AdminTeamCard;
