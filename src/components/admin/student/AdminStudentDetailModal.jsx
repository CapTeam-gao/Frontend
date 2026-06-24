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

const InfoItem = ({ label, value }) => (
    <article className={styles.infoItem}>
        <span>{label}</span>
        <strong>{value}</strong>
    </article>
);

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
            <div className={styles.sectionHeader}>
                <div>
                    <span className={styles.sectionEyebrow}>Survey</span>
                    <h3>응답 신뢰도</h3>
                </div>

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
            <div className={styles.sectionHeader}>
                <div>
                    <span className={styles.sectionEyebrow}>Analysis</span>
                    <h3>{title}</h3>
                </div>
            </div>

            {hasData ? (
                <div className={styles.chartBox}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={data} outerRadius="70%">
                            <PolarGrid stroke="#dfe5eb" />
                            <PolarAngleAxis
                                dataKey="label"
                                tick={{
                                    fill: "#344054",
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
                                fillOpacity={0.24}
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
    const teamDisplayName =
        student.projectTeamName || student.teamName || "미배정";
    const studentLevelLabel =
        levelLabels[student.studentLevel] || student.studentLevel || "분석 전";
    const studentRoleLabel =
        roleLabels[student.studentRole] || student.studentRole;

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
                    <div className={styles.profileArea}>
                        <div className={styles.avatar}>
                            {student.name?.slice(0, 1)}
                        </div>

                        <div className={styles.meta}>
                            <span className={styles.modalLabel}>학생 상세</span>
                            <h2 id="student-modal-title">{student.name}</h2>
                            <div className={styles.headerBadges}>
                                <span>{studentLevelLabel}</span>
                                <span>{teamDisplayName}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        aria-label="학생 상세 모달 닫기"
                        onClick={onClose}
                    >
                        닫기
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
                    <div className={styles.modalContent}>
                        <div className={styles.infoColumn}>
                            <section className={styles.summaryPanel}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <span className={styles.sectionEyebrow}>
                                            Profile
                                        </span>
                                        <h3>기본 정보</h3>
                                    </div>
                                </div>

                                <div className={styles.detailGrid}>
                                    <InfoItem
                                        label="학년/반/번호"
                                        value={
                                            getStudentNumberInfo(student.userId)
                                                .classText
                                        }
                                    />
                                    <InfoItem
                                        label="희망 직군"
                                        value={studentRoleLabel}
                                    />
                                    <InfoItem
                                        label="소속 팀"
                                        value={teamDisplayName}
                                    />
                                    <InfoItem
                                        label="팀장 선호"
                                        value={student.wantsLeader ? "O" : "X"}
                                    />
                                </div>
                            </section>

                            <section className={styles.detailSection}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <span className={styles.sectionEyebrow}>
                                            Skill
                                        </span>
                                        <h3>기술 스택</h3>
                                    </div>
                                </div>

                                <div className={styles.modalStackList}>
                                    {(student.skill || []).map((stack) => (
                                        <span key={stack}>{stack}</span>
                                    ))}
                                </div>
                            </section>

                            <section className={styles.detailSection}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <span className={styles.sectionEyebrow}>
                                            Team
                                        </span>
                                        <h3>선호 팀원</h3>
                                    </div>
                                </div>

                                <div className={styles.modalStackList}>
                                    {(student.preferredTeammates || []).length >
                                    0 ? (
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
                            </section>

                            <section className={styles.detailSection}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <span className={styles.sectionEyebrow}>
                                            Experience
                                        </span>
                                        <h3>구현해본 기능</h3>
                                    </div>
                                </div>

                                <ul className={styles.experienceList}>
                                    {(student.experience || []).map(
                                        (experience) => (
                                            <li key={experience}>
                                                {experience}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </section>

                            {student.analysisResult && (
                                <section className={styles.detailSection}>
                                    <div className={styles.sectionHeader}>
                                        <div>
                                            <span
                                                className={
                                                    styles.sectionEyebrow
                                                }
                                            >
                                                AI Insight
                                            </span>
                                            <h3>학생 분석 결과</h3>
                                        </div>
                                    </div>

                                    <ul className={styles.experienceList}>
                                        <li>{student.analysisResult}</li>
                                    </ul>
                                </section>
                            )}
                        </div>

                        <aside className={styles.chartColumn}>
                            <StudentRadarChart
                                title="개발 성향"
                                data={developmentChartData}
                            />
                            <StudentRadarChart
                                title="성격 성향"
                                data={personalityChartData}
                            />
                            <SurveyReliabilityCard student={student} />
                        </aside>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminStudentDetailModal;
