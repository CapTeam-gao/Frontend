import { useNavigate } from "react-router-dom";
import { gradeLabels } from "../../../constants/team";
import { parseMainFeatures } from "../../../utils/projectPlan";
import {
    hasProjectInfo,
    getTeamDisplayName,
} from "../../../utils/teamRecommendation";
import AdminTeamInsightPanel from "./AdminTeamInsightPanel";
import AdminTeamMemberPanel from "./AdminTeamMemberPanel";
import AdminTeamProjectPanel from "./AdminTeamProjectPanel";
import styles from "./AdminTeamDetailModal.module.css";

const AdminTeamDetailModal = ({ team, loading, error, onClose }) => {
    const navigate = useNavigate();

    if (!team && !loading && !error) return null;

    const projectWritten = hasProjectInfo(team);
    const members = team?.members || [];
    const displayTeamName = getTeamDisplayName(team, projectWritten);
    const mainFeatures = parseMainFeatures(team?.mainFeatures);
    const teamStrength = team?.strengths;
    const teamWeakness = team?.weaknesses;

    const moveToStudentDetail = (userId) => {
        navigate(`/admin/student?userId=${encodeURIComponent(userId)}`);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <section
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                >
                    X
                </button>

                {loading && (
                    <p className={styles.modalStatus}>불러오는 중...</p>
                )}
                {error && <p className={styles.modalError}>{error}</p>}

                {team && (
                    <>
                        <header className={styles.modalHeader}>
                            <div>
                                <div className={styles.teamTitleGroup}>
                                    <h2>{displayTeamName}</h2>
                                    <span>
                                        {gradeLabels[team.grade] || team.grade}
                                    </span>
                                    <p>
                                        스크롤하여 더 많은 학생과 주요 기능
                                        확인이 가능하며 학생 클릭 시 상세 조회가
                                        가능합니다.
                                    </p>
                                </div>
                            </div>
                        </header>

                        <div className={styles.modalContent}>
                            <AdminTeamProjectPanel
                                projectWritten={projectWritten}
                                team={team}
                                mainFeatures={mainFeatures}
                            />
                            <AdminTeamMemberPanel
                                members={members}
                                onMemberClick={moveToStudentDetail}
                            />
                            <AdminTeamInsightPanel
                                strength={teamStrength}
                                weakness={teamWeakness}
                            />
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default AdminTeamDetailModal;
