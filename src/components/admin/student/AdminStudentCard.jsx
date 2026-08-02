import { roleLabels } from "../../../constants/student";
import { getStudentNumberInfo } from "../../../utils/student";
import styles from "./AdminStudentCard.module.css";

const AdminStudentCard = ({ student, onClick }) => {
    const numberInfo = getStudentNumberInfo(student.userId);

    if (!student.surveyCompleted) {
        return (
            <button
                type="button"
                className={`${styles.studentCard} ${styles.pending}`}
                onClick={onClick}
            >
                <div className={styles.titleRow}>
                    <span className={styles.studentName}>
                        {student.name}
                    </span>
                    <span className={styles.studentClass}>
                        {numberInfo.classText}
                    </span>
                </div>
                <p className={`${styles.studentStatus} ${styles.pending}`}>
                    설문 미완료
                </p>
            </button>
        );
    }

    const teamDisplayName =
        student.projectTeamName || student.teamName || "미배정";
    const roleSummary = `${teamDisplayName} · ${
        roleLabels[student.studentRole] || student.studentRole
    }`;
    const visibleSkills = Array.isArray(student.skill)
        ? student.skill.slice(0, 4)
        : [];

    return (
        <button
            type="button"
            className={`${styles.studentCard} ${styles.done}`}
            onClick={onClick}
        >
            <div className={styles.titleRow}>
                <span className={styles.studentName}>{student.name}</span>
                <span className={styles.studentClass}>
                    {numberInfo.classText}
                </span>
            </div>

            <p className={styles.roleSummary}>{roleSummary}</p>

            <div className={styles.cardBody}>
                {visibleSkills.length > 0 ? (
                    <div className={styles.skillRow}>
                        <span>기술 스택</span>
                        <strong>{visibleSkills.join(" · ")}</strong>
                    </div>
                ) : (
                    <p className={styles.emptyText}>
                        기술 스택 정보가 없습니다.
                    </p>
                )}
            </div>

            <p className={styles.cardFooter}>클릭하여 상세 확인</p>
        </button>
    );
};

export default AdminStudentCard;
