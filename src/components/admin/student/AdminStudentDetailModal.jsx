import { levelLabels, roleLabels } from "../../../constants/student";
import { getStudentNumberInfo } from "../../../utils/student";
import styles from "./AdminStudentDetailModal.module.css";

const AdminStudentDetailModal = ({ student, modalError, onClose }) => {
    return (
        <div
            className={styles.modalOverlay}
            role="presentation"
            onClick={onClose}
        >
            <section
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="student-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <div className={styles.meta}>
                        <h2 id="student-modal-title">{student.name}</h2>
                        <span>
                            {levelLabels[student.studentLevel] ||
                                student.studentLevel ||
                                "분석 전"}
                        </span>
                    </div>
                    <button
                        type="button"
                        className={styles.closeButton}
                        aria-label="학생 상세 모달 닫기"
                        onClick={onClose}
                    >
                        X
                    </button>
                </div>

                {modalError && <p className={styles.errorText}>{modalError}</p>}

                {!student.surveyCompleted ? (
                    <div className={styles.emptySurveyMessage}>
                        <strong>설문이 미완료입니다</strong>
                        <p>
                            학생이 설문을 제출하면 기술 스택과 구현 경험을 확인할
                            수 있습니다.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className={styles.detailGrid}>
                            <article>
                                <span>학년/반/번호</span>
                                <strong>
                                    {getStudentNumberInfo(student.userId).classText}
                                </strong>
                            </article>
                            <article>
                                <span>희망 직군</span>
                                <strong>
                                    {roleLabels[student.studentRole] ||
                                        student.studentRole}
                                </strong>
                            </article>

                            <article>
                                <span>소속 팀</span>
                                <strong>{student.teamName || "미배정"}</strong>
                            </article>
                            <article>
                                <span>팀장 선호</span>
                                <strong>{student.wantsLeader ? "O" : "X"}</strong>
                            </article>
                        </div>

                        <div className={styles.detailSection}>
                            <h3>기술 스택</h3>
                            <div className={styles.modalStackList}>
                                {(student.skill || []).map((stack) => (
                                    <span key={stack}>{stack}</span>
                                ))}
                            </div>
                        </div>

                        <div className={styles.detailSection}>
                            <h3>선호 팀원</h3>
                            <div className={styles.modalStackList}>
                                {(student.preferredTeammates || []).length > 0 ? (
                                    student.preferredTeammates.map((member) => (
                                        <span key={member}>{member}</span>
                                    ))
                                ) : (
                                    <span>없음</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.detailSection}>
                            <h3>구현해본 기능</h3>
                            <ul className={styles.experienceList}>
                                {(student.experience || []).map((experience) => (
                                    <li key={experience}>{experience}</li>
                                ))}
                            </ul>
                        </div>

                        {student.analysisResult && (
                            <div className={styles.detailSection}>
                                <h3>학생 분석 결과</h3>
                                <ul className={styles.experienceList}>
                                    <li>{student.analysisResult}</li>
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default AdminStudentDetailModal;
