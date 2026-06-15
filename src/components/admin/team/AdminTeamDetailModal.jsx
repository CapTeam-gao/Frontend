import { gradeLabels, roleLabels } from "../../../constants/team";
import {
    getRoleCountSummary,
    hasProjectInfo,
} from "../../../utils/teamRecommendation";
import styles from "./AdminTeamDetailModal.module.css";

const AdminTeamDetailModal = ({ team, loading, error, onClose }) => {
    if (!team && !loading && !error) return null;

    const projectWritten = hasProjectInfo(team);

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
                                <h2>{team.serviceName || team.teamName}</h2>
                                <p>{gradeLabels[team.grade] || team.grade}</p>
                            </div>
                            <strong>{getRoleCountSummary(team.roleCount)}</strong>
                        </header>

                        {projectWritten ? (
                            <div className={styles.modalContent}>
                                <div className={styles.projectPanel}>
                                    <section className={styles.projectGrid}>
                                        <div>
                                            <h3>서비스 소개</h3>
                                            <p>{team.serviceIntro}</p>
                                        </div>
                                        <div>
                                            <h3>주요 기능 정리</h3>
                                            <p>{team.mainFeatures}</p>
                                        </div>
                                    </section>

                                    <section className={styles.highlightBox}>
                                        <h3>강점</h3>
                                        <p>
                                            역할 분배와 프로젝트 정보가 입력되어
                                            팀 진행 상황을 빠르게 확인할 수
                                            있습니다.
                                        </p>
                                    </section>

                                    <section
                                        className={`${styles.highlightBox} ${styles.warningBox}`}
                                    >
                                        <h3>확인 필요</h3>
                                        <p>
                                            기획서 내용과 실제 팀 역할이 맞는지
                                            발표 전 한 번 더 확인해주세요.
                                        </p>
                                    </section>
                                </div>

                                <aside className={styles.memberPanel}>
                                    {(team.members || []).map((member) => (
                                        <div
                                            key={member.userId}
                                            className={styles.modalMember}
                                        >
                                            <strong>{member.name}</strong>
                                            <div>
                                                {member.leaderRole ===
                                                    "LEADER" && (
                                                    <span
                                                        className={
                                                            styles.leaderBadge
                                                        }
                                                    >
                                                        팀장
                                                    </span>
                                                )}
                                                <p>
                                                    {roleLabels[
                                                        member.studentRole
                                                    ] || member.studentRole}
                                                    {member.skill?.length
                                                        ? ` | ${member.skill.join(
                                                              ", "
                                                          )}`
                                                        : ""}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </aside>
                            </div>
                        ) : (
                            <div className={styles.emptyModal}>
                                정보가 입력되지 않았습니다.
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default AdminTeamDetailModal;
