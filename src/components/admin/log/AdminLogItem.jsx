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
    const canOpenDetail = Boolean(log.journalId);

    const content = (
        <>
            <div className={styles.mainInfo}>
                <div className={styles.titleRow}>
                    <span className={styles.logTeam}>{teamName}</span>
                    <span className={styles.gradeBadge}>
                        {getLogGradeLabel(log.grade)}
                    </span>
                </div>
                <p className={styles.logService}>
                    {log.serviceName || "프로젝트 정보가 입력되지 않았습니다."}
                </p>
            </div>

            <div className={styles.submitInfo}>
                <strong
                    className={`${styles.logSubmitText} ${
                        submitted ? styles.submitted : styles.pending
                    }`}
                >
                    {submitted
                        ? `${log.submittedMemberCount}/${log.totalMemberCount}명 제출`
                        : `${log.notSubmittedMemberCount}명 미제출`}
                </strong>
            </div>

            <time className={styles.dateText}>{formatLogDate(log.date)}</time>
            {canOpenDetail && (
                <svg
                    className={styles.chevron}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="m9 18 6-6-6-6" />
                </svg>
            )}
        </>
    );

    const itemClassName = `${styles.logRow} ${
        !canOpenDetail ? styles.disabled : ""
    }`;

    if (!canOpenDetail) {
        return (
            <div className={itemClassName} aria-disabled="true">
                {content}
            </div>
        );
    }

    return (
        <Link to={`/admin/log/${log.journalId}`} className={itemClassName}>
            {content}
        </Link>
    );
};

export default AdminLogItem;
