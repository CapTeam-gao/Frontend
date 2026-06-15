import { getStudentNumberInfo } from "../../../utils/student";
import styles from "./AdminStudentCard.module.css";

const AdminStudentCard = ({ student, onClick }) => {
    const numberInfo = getStudentNumberInfo(student.userId);
    const visibleSkills = Array.isArray(student.skill)
        ? student.skill.slice(0, 4)
        : [];

    return (
        <button type="button" className={styles.studentCard} onClick={onClick}>
            <div className={styles.cardHeader}>
                <div>
                    <strong>{student.name}</strong>
                    <p>{numberInfo.classText}</p>
                </div>
                <span
                    className={
                        student.surveyCompleted
                            ? styles.doneBadge
                            : styles.pendingBadge
                    }
                >
                    {student.surveyCompleted ? "설문 완료" : "설문 미완료"}
                </span>
            </div>

            <div className={styles.cardMeta}>
                <span>소속 팀</span>
                <strong>{student.teamName || "미배정"}</strong>
            </div>

            <div className={styles.cardSkillList}>
                {visibleSkills.length > 0 ? (
                    visibleSkills.map((skill) => <span key={skill}>{skill}</span>)
                ) : (
                    <span>기술 정보 없음</span>
                )}
            </div>

            <p className={styles.cardHint}>
                {student.surveyCompleted
                    ? "클릭하여 상세 정보 확인"
                    : "설문이 미완료입니다"}
            </p>
        </button>
    );
};

export default AdminStudentCard;
