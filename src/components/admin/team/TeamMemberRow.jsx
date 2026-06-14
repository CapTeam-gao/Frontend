import { levelLabels, roleLabels } from "../../../constants/team";
import styles from "./TeamMemberRow.module.css";

const TeamMemberRow = ({ member, selected, highlighted, onClick }) => {
    const isLeader = member.recommendedLeader;

    return (
        <li
            className={`${styles.memberItem} ${
                selected ? styles.selectedMember : ""
            } ${highlighted ? styles.highlightedMember : ""} ${
                isLeader ? styles.leaderMember : ""
            }`}
        >
            <button
                type="button"
                className={styles.memberButton}
                disabled={isLeader}
                onClick={onClick}
                title={isLeader ? "팀장은 변경할 수 없습니다." : undefined}
            >
                <div className={styles.memberMain}>
                    <strong className={styles.memberName}>{member.name}</strong>
                    {isLeader && (
                        <span className={styles.leaderBadge}>팀장</span>
                    )}
                </div>
                <div className={styles.memberSub}>
                    <span className={styles.positionBadge}>
                        {roleLabels[member.studentRole] || member.studentRole}
                    </span>
                    <span className={styles.stackText}>
                        {member.skill || "스택 미입력"}
                    </span>
                    <span className={styles.levelText}>
                        {levelLabels[member.studentLevel] ||
                            member.studentLevel ||
                            "-"}
                    </span>
                </div>
            </button>
        </li>
    );
};

export default TeamMemberRow;
