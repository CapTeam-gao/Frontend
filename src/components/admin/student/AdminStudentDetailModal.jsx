import { levelLabels, roleLabels } from "../../../constants/student";
import { getStudentNumberInfo } from "../../../utils/student";
import styles from "./AdminStudentDetailModal.module.css";
import {
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
} from "recharts";

const getDevelopmentChartData = (student) => [
    { label: "리더십", score: student.leadership },
    { label: "문제 해결", score: student.problemSolving },
    { label: "구현력", score: student.implementation },
    { label: "학습력", score: student.learningAbility },
    { label: "기획력", score: student.planning },
];

const getPersonalityChartData = (student) => [
    { label: "소통", score: student.communication },
    { label: "책임감", score: student.responsibility },
    { label: "협업", score: student.collaboration },
    { label: "유연성", score: student.flexibility },
    { label: "안정성", score: student.emotionalStability },
];

const reliabilityLabels = {
    HIGH: "높음",
    MEDIUM: "보통",
    LOW: "낮음",
};

const reliabilityDescriptions = {
    HIGH: "문항 간 답변 흐름이 안정적입니다.",
    MEDIUM: "일부 문항에서 답변 차이가 있어 참고가 필요합니다.",
    LOW: "문항 간 답변 차이가 커 관리자 확인이 필요합니다.",
};

const SurveyReliabilityCard = ({ student }) => {
    const reliability = student.responseReliability;
    const inconsistentCount = student.inconsistentAnswers;
    const hasReliabilityData =
        reliability !== null &&
        reliability !== undefined &&
        inconsistentCount !== null &&
        inconsistentCount !== undefined;

    return (
        <article className={styles.reliabilityCard}>
            <div className={styles.reliabilityHeader}>
                <h3>응답 신뢰도</h3>
                {hasReliabilityData && (
                    <span
                        className={`${styles.reliabilityBadge} ${
                            styles[`reliability${reliability}`]
                        }`}
                    >
                        {reliabilityLabels[reliability] || reliability}
                    </span>
                )}
            </div>

            {hasReliabilityData ? (
                <>
                    <strong className={styles.reliabilityCount}>
                        일관성 낮은 응답 {inconsistentCount}개
                    </strong>
                    <p>
                        {reliabilityDescriptions[reliability] ||
                            "응답 신뢰도 값을 확인했습니다."}
                    </p>
                </>
            ) : (
                <p className={styles.reliabilityEmptyText}>
                    응답 신뢰도 정보를 아직 조회할 수 없습니다.
                </p>
            )}
        </article>
    );
};

const StudentRadarChart = ({ title, data }) => {
    const hasData = data.every(
        (item) => item.score !== null && item.score !== undefined
    );

    return (
        <article className={styles.chartCard}>
            <h3>{title}</h3>

            {hasData ? (
                <div className={styles.chartBox}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={data} outerRadius="70%">
                            <PolarGrid />
                            <PolarAngleAxis
                                dataKey="label"
                                tick={{
                                    fill: "#111827",
                                    fontSize: 12,
                                    fontWeight: 700,
                                }}
                            />
                            <PolarRadiusAxis
                                domain={[0, 5]}
                                tickCount={6}
                                tick={false}
                                axisLine={false}
                            />
                            <Radar
                                dataKey="score"
                                stroke="#5fc89b"
                                fill="#5fc89b"
                                fillOpacity={0.28}
                                dot={false}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p className={styles.emptyChartText}>
                    성향 점수 데이터가 없습니다.
                </p>
            )}
        </article>
    );
};

const AdminStudentDetailModal = ({ student, modalError, onClose }) => {
    const developmentChartData = getDevelopmentChartData(student);
    const personalityChartData = getPersonalityChartData(student);
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
                            학생이 설문을 제출하면 기술 스택과 구현 경험을
                            확인할 수 있습니다.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className={styles.modalContent}>
                            <div className={styles.infoColumn}>
                                <div className={styles.detailGrid}>
                                    <article>
                                        <span>학년/반/번호</span>
                                        <strong>
                                            {
                                                getStudentNumberInfo(
                                                    student.userId
                                                ).classText
                                            }
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
                                        <strong>
                                            {student.teamName || "미배정"}
                                        </strong>
                                    </article>
                                    <article>
                                        <span>팀장 선호</span>
                                        <strong>
                                            {student.wantsLeader ? "O" : "X"}
                                        </strong>
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
                                        {(student.preferredTeammates || [])
                                            .length > 0 ? (
                                            student.preferredTeammates.map(
                                                (member) => (
                                                    <span key={member}>
                                                        {member}
                                                    </span>
                                                )
                                            )
                                        ) : (
                                            <span>없음</span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.detailSection}>
                                    <h3>구현해본 기능</h3>
                                    <ul className={styles.experienceList}>
                                        {(student.experience || []).map(
                                            (experience) => (
                                                <li key={experience}>
                                                    {experience}
                                                </li>
                                            )
                                        )}
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
                            </div>

                            <aside className={styles.chartColumn}>
                                <div className={styles.chartGrid}>
                                    <StudentRadarChart
                                        title="개발 성향"
                                        data={developmentChartData}
                                    />
                                    <StudentRadarChart
                                        title="성격 성향"
                                        data={personalityChartData}
                                    />
                                </div>

                                <SurveyReliabilityCard student={student} />
                            </aside>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default AdminStudentDetailModal;
