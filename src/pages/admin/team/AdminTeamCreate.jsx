import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import { requestAdminDashboard } from "../../../api/dashboardApi";
import { requestAdminStudentList } from "../../../api/studentApi";
import {
    DEFAULT_TEAM_CREATE_GRADE,
    getAdminTeamCreationStatus,
    isGradeTeamCreated,
} from "../../../utils/teamStatus";
import {
    getActiveMatchingJobLock,
    gradeLabels,
} from "../../../utils/matchingJobLock";
import heroVisualPending from "../../../assets/images/teamCreateHeroPending.png";
import heroVisualDone from "../../../assets/images/teamCreateHeroDone.png";
import styles from "./AdminTeamCreate.module.css";

const MODE_COPY = {
    AI_AUTO: {
        button: (gradeLabel) => `${gradeLabel} 팀 생성하기`,
        note: "생성에는 약 1~2분이 소요됩니다.",
    },
    MANUAL: {
        button: (gradeLabel) => `${gradeLabel} 팀 직접 구성하기`,
        note: "AI 생성 없이 바로 팀 구성 화면으로 이동합니다.",
    },
};

const AdminTeamCreate = () => {
    const navigate = useNavigate();
    const [selectedGrade, setSelectedGrade] = useState(
        DEFAULT_TEAM_CREATE_GRADE
    );
    const [selectedMode, setSelectedMode] = useState("AI_AUTO");
    const [teamStatus, setTeamStatus] = useState({
        grade2TeamCreated: false,
        grade3TeamCreated: false,
        grade2TeamCount: 0,
        grade3TeamCount: 0,
    });
    const [students, setStudents] = useState([]);
    const [error, setError] = useState("");

    const selectedGradeLabel = gradeLabels[selectedGrade];

    useEffect(() => {
        const getTeamCreateData = async () => {
            try {
                const [dashboardResult, studentResult] =
                    await Promise.allSettled([
                        requestAdminDashboard(),
                        requestAdminStudentList(),
                    ]);

                if (dashboardResult.status === "fulfilled") {
                    const dashboard = dashboardResult.value;
                    const nextTeamStatus =
                        getAdminTeamCreationStatus(dashboard);
                    setTeamStatus({
                        ...nextTeamStatus,
                        grade2TeamCount: dashboard.grade2TeamCount,
                        grade3TeamCount: dashboard.grade3TeamCount,
                    });

                    if (
                        nextTeamStatus.grade2TeamCreated &&
                        !nextTeamStatus.grade3TeamCreated
                    ) {
                        setSelectedGrade("GRADE_3");
                    } else if (
                        !nextTeamStatus.grade2TeamCreated &&
                        nextTeamStatus.grade3TeamCreated
                    ) {
                        setSelectedGrade("GRADE_2");
                    }
                }

                if (studentResult.status === "fulfilled") {
                    setStudents(
                        Array.isArray(studentResult.value?.students)
                            ? studentResult.value.students
                            : []
                    );
                }
            } catch {
                setError("팀 생성 상태를 불러오지 못했습니다.");
            }
        };

        getTeamCreateData();
    }, []);

    const handleGradeChange = (grade) => {
        setSelectedGrade(grade);
        setError("");
    };

    const handleCreate = () => {
        if (selectedMode === "MANUAL") {
            navigate("/admin/team-manual-create", {
                state: { grade: selectedGrade },
            });
            return;
        }

        const activeLock = getActiveMatchingJobLock();

        if (activeLock) {
            const activeGradeLabel =
                gradeLabels[activeLock.grade] || "선택한 학년";

            setError(
                `${activeGradeLabel} 팀 생성 작업이 진행 중입니다. 완료 후 다시 시도해주세요.`
            );
            return;
        }

        if (isGradeTeamCreated(teamStatus, selectedGrade)) {
            setError("이미 생성이 완료된 학년입니다.");
            return;
        }

        navigate("/admin/team-create/loading", {
            state: { grade: selectedGrade },
        });
    };

    const isSelectedGradeCreated = isGradeTeamCreated(
        teamStatus,
        selectedGrade
    );
    const gradeStudents = students.filter(
        (student) => student.grade === selectedGrade
    );
    const respondedCount = gradeStudents.filter(
        (student) => student.surveyCompleted
    ).length;
    const notRespondedCount = gradeStudents.length - respondedCount;
    const surveyPercent = gradeStudents.length
        ? Math.round((respondedCount / gradeStudents.length) * 100)
        : 0;
    const selectedGradeTeamCount =
        selectedGrade === "GRADE_2"
            ? teamStatus.grade2TeamCount
            : teamStatus.grade3TeamCount;

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <section className={styles.hero}>
                    <div className={styles.heroGrid}>
                        <div>
                            <div className={styles.heroEyebrow}>팀 관리</div>
                            <h1 className={styles.heroTitle}>
                                설문 데이터를 기반으로
                                <br />
                                <em>학년별 팀 추천안</em>을 생성합니다
                            </h1>
                            <p className={styles.heroSub}>
                                희망 직군, 기술 스택, 실행력·협업 성향 점수를
                                함께 고려해 AI가 팀 구성을 추천합니다. 생성
                                후에도 팀원 교체와 재생성이 가능합니다.
                            </p>
                        </div>

                        <div className={styles.heroVisual}>
                            <img
                                src={
                                    isSelectedGradeCreated
                                        ? heroVisualDone
                                        : heroVisualPending
                                }
                                alt=""
                            />
                        </div>
                    </div>
                </section>

                <div className={styles.gradeTabs} role="tablist">
                    {["GRADE_2", "GRADE_3"].map((grade) => (
                        <button
                            key={grade}
                            type="button"
                            className={`${styles.gradeTab} ${
                                selectedGrade === grade ? styles.active : ""
                            }`}
                            onClick={() => handleGradeChange(grade)}
                        >
                            {gradeLabels[grade]}
                            <span
                                className={`${styles.status} ${
                                    isGradeTeamCreated(teamStatus, grade)
                                        ? styles.done
                                        : styles.progress
                                }`}
                            >
                                {isGradeTeamCreated(teamStatus, grade)
                                    ? "생성 완료"
                                    : "생성 전"}
                            </span>
                        </button>
                    ))}
                </div>

                {isSelectedGradeCreated ? (
                    <div className={styles.gradePanel}>
                        <div className={`${styles.statusRow} ${styles.isDone}`}>
                            <div className={styles.doneBanner}>
                                <div className={styles.doneBadge}>✓</div>
                                <div className={styles.doneText}>
                                    <strong>
                                        {selectedGradeLabel} 팀 생성이
                                        완료되었습니다
                                    </strong>
                                    <span>
                                        총 {selectedGradeTeamCount}팀 구성 완료
                                    </span>
                                </div>
                                <Link
                                    to="/admin/team-manage"
                                    className={styles.doneLink}
                                >
                                    팀 관리 보기 →
                                </Link>
                            </div>
                        </div>

                        <div className={styles.criteria}>
                            <div className={styles.criteriaTitle}>
                                생성 기준
                            </div>
                            <div className={styles.criteriaList}>
                                <div className={styles.criteriaItem}>
                                    <span className={styles.criteriaIndex}>
                                        01
                                    </span>
                                    <div>
                                        <div className={styles.criteriaHeading}>
                                            역할 분산
                                        </div>
                                        <p className={styles.criteriaBody}>
                                            희망 직군과 기술 스택을 기준으로{" "}
                                            <b>프론트엔드, 백엔드, AI, 앱</b> 등
                                            역할이 한 팀에 몰리지 않도록
                                            구성합니다.
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.criteriaItem}>
                                    <span className={styles.criteriaIndex}>
                                        02
                                    </span>
                                    <div>
                                        <div className={styles.criteriaHeading}>
                                            실행력 균형
                                        </div>
                                        <p className={styles.criteriaBody}>
                                            구현 경험과{" "}
                                            <b>개발 실행력, 문제 해결력</b>{" "}
                                            점수를 함께 참고해 프로젝트를
                                            안정적으로 진행할 수 있는 팀을
                                            구성합니다.
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.criteriaItem}>
                                    <span className={styles.criteriaIndex}>
                                        03
                                    </span>
                                    <div>
                                        <div className={styles.criteriaHeading}>
                                            협업 성향 매칭
                                        </div>
                                        <p className={styles.criteriaBody}>
                                            발표/설명, 리더십/정리, 시간 압박
                                            대응, 체력/집중 유지 점수를 함께
                                            반영해{" "}
                                            <b>장기 프로젝트 협업 흐름</b>을
                                            고려합니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className={styles.doneNote}>
                            이미 생성이 완료된 학년입니다. 팀 구성을 변경하려면
                            팀 관리에서 재생성을 요청하세요.
                        </p>
                    </div>
                ) : (
                    <div className={styles.gradePanel}>
                        <div className={styles.statusRow}>
                            <div>
                                <div className={styles.heroProgressTrack}>
                                    <div
                                        className={styles.heroProgressFill}
                                        style={{
                                            width: `${surveyPercent}%`,
                                        }}
                                    />
                                </div>
                                <div className={styles.heroProgressLabel}>
                                    {selectedGradeLabel} 설문 완료{" "}
                                    <b>
                                        {respondedCount} /{" "}
                                        {gradeStudents.length}명
                                    </b>{" "}
                                    ·{" "}
                                    <span className={styles.progressPercent}>
                                        {surveyPercent}%
                                    </span>
                                </div>
                            </div>
                            <p className={styles.statusNote}>
                                설문 미완료 학생이 <b>{notRespondedCount}명</b>
                                입니다.
                            </p>
                        </div>

                        <div className={styles.modeSelect}>
                            <div className={styles.criteriaTitle}>
                                팀 구성 방식
                            </div>
                            <div className={styles.modeOptions}>
                                <label
                                    className={`${styles.modeOption} ${
                                        selectedMode === "AI_AUTO"
                                            ? styles.active
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="mode"
                                        value="AI_AUTO"
                                        checked={selectedMode === "AI_AUTO"}
                                        onChange={() =>
                                            setSelectedMode("AI_AUTO")
                                        }
                                    />
                                    <div className={styles.modeHeading}>
                                        AI 자동 배정
                                    </div>
                                    <p className={styles.modeDesc}>
                                        설문 데이터를 기반으로 AI가 팀 구성을
                                        추천합니다.
                                    </p>
                                </label>
                                <label
                                    className={`${styles.modeOption} ${
                                        selectedMode === "MANUAL"
                                            ? styles.active
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="mode"
                                        value="MANUAL"
                                        checked={selectedMode === "MANUAL"}
                                        onChange={() =>
                                            setSelectedMode("MANUAL")
                                        }
                                    />
                                    <div className={styles.modeHeading}>
                                        직접 팀 구성
                                    </div>
                                    <p className={styles.modeDesc}>
                                        AI 추천 없이 학생 명단에서 직접 팀을
                                        구성합니다.
                                    </p>
                                </label>
                            </div>
                        </div>

                        {selectedMode === "AI_AUTO" ? (
                            <div className={styles.criteria}>
                                <div className={styles.criteriaTitle}>
                                    생성 기준
                                </div>
                                <div className={styles.criteriaList}>
                                    <div className={styles.criteriaItem}>
                                        <span className={styles.criteriaIndex}>
                                            01
                                        </span>
                                        <div>
                                            <div
                                                className={
                                                    styles.criteriaHeading
                                                }
                                            >
                                                역할 분산
                                            </div>
                                            <p className={styles.criteriaBody}>
                                                희망 직군과 기술 스택을 기준으로{" "}
                                                <b>
                                                    프론트엔드, 백엔드, AI, 앱
                                                </b>{" "}
                                                등 역할이 한 팀에 몰리지 않도록
                                                구성합니다.
                                            </p>
                                        </div>
                                    </div>
                                    <div className={styles.criteriaItem}>
                                        <span className={styles.criteriaIndex}>
                                            02
                                        </span>
                                        <div>
                                            <div
                                                className={
                                                    styles.criteriaHeading
                                                }
                                            >
                                                실행력 균형
                                            </div>
                                            <p className={styles.criteriaBody}>
                                                구현 경험과{" "}
                                                <b>개발 실행력, 문제 해결력</b>{" "}
                                                점수를 함께 참고해 프로젝트를
                                                안정적으로 진행할 수 있는 팀을
                                                구성합니다.
                                            </p>
                                        </div>
                                    </div>
                                    <div className={styles.criteriaItem}>
                                        <span className={styles.criteriaIndex}>
                                            03
                                        </span>
                                        <div>
                                            <div
                                                className={
                                                    styles.criteriaHeading
                                                }
                                            >
                                                협업 성향 매칭
                                            </div>
                                            <p className={styles.criteriaBody}>
                                                발표/설명, 리더십/정리, 시간
                                                압박 대응, 체력/집중 유지 점수를
                                                함께 반영해{" "}
                                                <b>장기 프로젝트 협업 흐름</b>을
                                                고려합니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className={styles.manualNote}>
                                AI 추천 없이 <b>학생 명단에서 직접 팀을 구성</b>
                                합니다. 팀 구성 화면에서 학생을 검색해 추가하고,
                                팀별 정원을 확인할 수 있습니다.
                            </p>
                        )}

                        {error && <p className={styles.errorText}>{error}</p>}

                        <div className={styles.createActions}>
                            <span className={styles.createNote}>
                                {MODE_COPY[selectedMode].note}
                            </span>
                            <button
                                type="button"
                                className={styles.createButton}
                                onClick={handleCreate}
                            >
                                {MODE_COPY[selectedMode].button(
                                    selectedGradeLabel
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminTeamCreate;
