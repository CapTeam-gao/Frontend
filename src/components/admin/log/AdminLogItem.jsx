// 관리자 일지 타일: 날짜·제출 상태 / 팀명 / 제출 인원 칸 막대 / 열기
// 학년은 위 필터로 이미 골랐으니 타일에는 쓰지 않는다.
import { Link } from "react-router-dom";
import styles from "./AdminLogItem.module.css";
import {
    formatLogDate,
    getLogTeamName,
    isSubmittedLog,
} from "../../../utils/log";

const AdminLogItem = ({ log }) => {
    const submitted = isSubmittedLog(log);
    const teamName = getLogTeamName(log);
    const canOpenDetail = Boolean(log.journalId);
    const total = log.totalMemberCount ?? 0;
    const done = log.submittedMemberCount ?? 0;

    const content = (
        <>
            <div className={styles.top}>
                <time className={styles.dateText}>{formatLogDate(log.date)}</time>
                <span
                    className={`${styles.status} ${
                        submitted ? styles.submitted : styles.pending
                    }`}
                >
                    {submitted
                        ? "제출 완료"
                        : `${log.notSubmittedMemberCount}명 미제출`}
                </span>
            </div>

            <div className={styles.titleRow}>
                <span className={styles.logTeam}>{teamName}</span>
            </div>
            <p
                className={`${styles.logService} ${
                    log.serviceName ? "" : styles.logServiceEmpty
                }`}
            >
                {log.serviceName || "프로젝트 정보가 입력되지 않았어요"}
            </p>

            {total > 0 && (
                <div className={styles.members}>
                    <span
                        className={styles.memberSteps}
                        role="img"
                        aria-label={`${total}명 중 ${done}명 제출`}
                    >
                        {Array.from({ length: total }, (_, index) => (
                            <i
                                key={index}
                                className={index < done ? styles.memberDone : ""}
                            />
                        ))}
                    </span>
                    <span className={styles.memberText}>
                        <b>{done}</b> / {total}명 제출
                    </span>
                </div>
            )}

            <span className={styles.foot}>
                {canOpenDetail ? (
                    <>
                        일지 보기<span aria-hidden="true">→</span>
                    </>
                ) : (
                    "아직 작성된 일지가 없어요"
                )}
            </span>
        </>
    );

    if (!canOpenDetail) {
        return (
            <div className={`${styles.tile} ${styles.disabled}`} aria-disabled="true">
                {content}
            </div>
        );
    }

    return (
        <Link to={`/admin/log/${log.journalId}`} className={styles.tile}>
            {content}
        </Link>
    );
};

export default AdminLogItem;
