import { roleLabels } from "../../../constants/team";
import styles from "./AdminTeamDetailModal.module.css";

const AdminTeamMemberPanel = ({ members, onMemberClick }) => {
    return (
        <aside className={styles.memberPanel}>
            <div className={styles.sectionHeader}>
                <span>팀원 구성</span>
                <strong>{members.length}명</strong>
            </div>

            <div className={styles.memberList}>
                {members.map((member) => (
                    <article key={member.userId} className={styles.modalMember}>
                        <div className={styles.memberTop}>
                            <div className={styles.memberNameArea}>
                                <button
                                    type="button"
                                    className={styles.memberNameButton}
                                    onClick={() => onMemberClick(member.userId)}
                                >
                                    {member.name}
                                </button>
                                {member.leaderRole === "LEADER" && (
                                    <span className={styles.leaderBadge}>
                                        팀장
                                    </span>
                                )}
                            </div>
                            <span className={styles.roleBadge}>
                                {roleLabels[member.studentRole] ||
                                    member.studentRole}
                            </span>
                        </div>

                        {member.skill?.length > 0 && (
                            <div className={styles.memberSkills}>
                                {member.skill.slice(0, 2).map((skill) => (
                                    <span key={skill}>{skill}</span>
                                ))}
                                {member.skill.length > 2 && (
                                    <span>+{member.skill.length - 2}</span>
                                )}
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </aside>
    );
};

export default AdminTeamMemberPanel;
