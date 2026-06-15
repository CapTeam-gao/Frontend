import { gradeLabels } from "../../../constants/team";
import {
    getRoleCountSummary,
    hasProjectInfo,
} from "../../../utils/teamRecommendation";
import AdminTeamMemberPrivew from "./AdminTeamMemberPrivew";
import styles from "./AdminTeamCard.module.css";

const AdminTeamCard = ({ team, onClick }) => {
    const projectWritten = hasProjectInfo(team);

    return (
        <button type="button" className={styles.teamCard} onClick={onClick}>
            <header className={styles.teamHeader}>
                <div className={styles.teamTitleGroup}>
                    <h2>{projectWritten ? team.serviceName : team.teamName}</h2>
                    <span>{gradeLabels[team.grade] || team.grade}</span>
                </div>
                <p className={styles.roleSummary}>
                    {getRoleCountSummary(team.roleCount)}
                </p>
            </header>

            {projectWritten ? (
                <>
                    <strong className={styles.projectTitle}>
                        {team.serviceName}
                    </strong>
                    <ul className={styles.memberPreviewList}>
                        {(team.members || []).map((member) => (
                            <AdminTeamMemberPrivew
                                key={`${team.teamId}-${member.name}-${member.studentRole}`}
                                member={member}
                            />
                        ))}
                    </ul>
                </>
            ) : (
                <div className={styles.emptyProject}>
                    정보가 입력되지 않았습니다.
                </div>
            )}
        </button>
    );
};

export default AdminTeamCard;
