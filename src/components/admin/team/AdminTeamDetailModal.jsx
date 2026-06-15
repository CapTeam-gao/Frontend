import { gradeLabels, roleLabels } from "../../../constants/team";
import {
    getRoleCountSummary,
    hasProjectInfo,
} from "../../../utils/teamRecommendation";
import styles from "./AdminTeamDetailModal.module.css";

const AdminTeamDetailModal = ({ team, loading, error, onClose }) => {
    if (!team && !loading && !error) return null;

    const projectWritten = hasProjectInfo(team);
    const members = team?.members || [];

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
                            <div className={styles.teamTitleGroup}>
                                <h2>{team.teamName}</h2>
                                <span>
                                    {gradeLabels[team.grade] || team.grade}
                                </span>
                            </div>
                            <strong className={styles.roleSummary}>
                                {getRoleCountSummary(team.roleCount)}
                            </strong>
                        </header>

                        {projectWritten ? (
                            <>
                                <h3 className={styles.projectTitle}>
                                    {team.serviceName}
                                </h3>

                                <div className={styles.modalContent}>
                                    <div className={styles.projectPanel}>
                                        <section className={styles.infoCard}>
                                            <h4>서비스 소개</h4>
                                            <p>{team.serviceIntro}</p>
                                        </section>

                                        <section className={styles.infoCard}>
                                            <h4>주요 기능 정리</h4>
                                            <p>{team.mainFeatures}</p>
                                        </section>
                                    </div>

                                    <aside className={styles.memberPanel}>
                                        {members.map((member) => (
                                            <div
                                                key={member.userId}
                                                className={styles.modalMember}
                                            >
                                                <div
                                                    className={
                                                        styles.memberNameArea
                                                    }
                                                >
                                                    <strong>
                                                        {member.name}
                                                    </strong>
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
                                                </div>
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
                                        ))}
                                    </aside>
                                </div>
                            </>
                        ) : (
                            <div className={styles.modalContent}>
                                <div className={styles.projectPanel}>
                                    <section className={styles.projectGrid}>
                                        <div>
                                            <h3>프로젝트 기획서</h3>
                                            <p>
                                                아직 프로젝트 기획서가 작성되지
                                                않았습니다.
                                            </p>
                                        </div>
                                        <div>
                                            <h3>작성 안내</h3>
                                            <p>
                                                학생이 프로젝트 기획서를 저장하면
                                                이곳에서 확인할 수 있습니다.
                                            </p>
                                        </div>
                                    </section>
                                </div>

                                <aside className={styles.memberPanel}>
                                    {members.map((member) => (
                                        <div
                                            key={member.userId}
                                            className={styles.modalMember}
                                        >
                                            <div
                                                className={
                                                    styles.memberNameArea
                                                }
                                            >
                                                <strong>{member.name}</strong>
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
                                            </div>
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
                                    ))}
                                </aside>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default AdminTeamDetailModal;
