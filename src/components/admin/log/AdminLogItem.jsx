import { Link } from "react-router-dom";
import styles from "./AdminLogItem.module.css";

const AdminLogItem = ({ log }) => {
    const submitted = log.status === "submitted";

    return (
        <Link
            to={`/admin/log/${log.id}`}
            className={`${styles.logItem} ${
                submitted ? styles.submitted : styles.pending
            }`}
        >
            <div className={styles.mainInfo}>
                <div className={styles.titleRow}>
                    <h2>{log.teamName}</h2>
                    <span className={styles.gradeBadge}>{log.grade}</span>
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
                <p>{log.projectName}</p>
                <span className={styles.submitText}>
                    {submitted
                        ? `${log.submittedCount}/${log.totalCount}명 제출`
                        : "미제출"}
                </span>
            </div>

            <time className={styles.dateText}>{log.date}</time>
        </Link>
    );
};

export default AdminLogItem;
