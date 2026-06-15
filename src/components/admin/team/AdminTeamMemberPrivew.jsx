import { roleLabels } from "../../../constants/team";
import styles from "./AdminTeamMemberPrivew.module.css";

const AdminTeamMemberPrivew = ({ member }) => {
    return (
        <li className={styles.memberPreview}>
            <strong>{member.name}</strong>
            {member.leaderRole === "LEADER" && (
                <span className={styles.leaderBadge}>팀장</span>
            )}
            <p>{roleLabels[member.studentRole] || member.studentRole}</p>
        </li>
    );
};

export default AdminTeamMemberPrivew;
