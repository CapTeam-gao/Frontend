import { Link } from "react-router-dom";
import styles from "./AdminLogItem.module.css";
import {
    formatLogDate,
    getLogGradeLabel,
    getLogTeamName,
    isSubmittedLog,
} from "../../../utils/log";

const AdminLogItem = ({ log }) => {
    const submitted = isSubmittedLog(log);
    const teamName = getLogTeamName(log);

    return (
        <Link
            to={`/admin/log/${log.journalId}`}
            className={`${styles.logItem} ${
                submitted ? styles.submitted : styles.pending
            }`}
        >
            <div className={styles.mainInfo}>
                <div className={styles.titleRow}>
                    <h2>{teamName}</h2>
                    <span className={styles.gradeBadge}>
                        {getLogGradeLabel(log.grade)}
                    </span>
                    <span
                        className={
                            submitted
                                ? styles.submittedBadge
                                : styles.pendingBadge
                        }
                    >
                        {submitted ? "제출완료" : "미제출"}
                    </span>
                </div>
                <p>{log.serviceName || "프로젝트 정보가 입력되지 않았습니다."}</p>
                <span className={styles.submitText}>
                    {submitted
                        ? `${log.submittedMemberCount}/${log.totalMemberCount}명 제출`
                        : `${log.notSubmittedMemberCount}명 미제출`}
                </span>
            </div>

            <time className={styles.dateText}>{formatLogDate(log.date)}</time>
        </Link>
    );
};

export default AdminLogItem;
