import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    requestStartTeamMatchingJob,
    requestTeamMatchingJob,
} from "../../../api/teamApi";
import {
    clearMatchingJobLock,
    getActiveMatchingJobLock,
    setMatchingJobLock,
    gradeLabels,
    MATCHING_POLL_INTERVAL,
    WAITING_JOB_STATUSES,
    wait,
} from "../../../utils/matchingJobLock";
import styles from "./AdminTeamCreateLoading.module.css";

const STEPS = [
    {
        title: "설문 데이터 분석",
        desc: "희망 직군, 기술 스택, 실행 경험을 취합합니다",
    },
    {
        title: "역할 밸런싱",
        desc: "프론트엔드·백엔드·AI·앱 역할이 몰리지 않도록 분산합니다",
    },
    {
        title: "협업 성향 매칭",
        desc: "리더십, 시간 압박 대응, 체력·집중 유지 점수를 반영합니다",
    },
    {
        title: "팀 구성 확정",
        desc: "추천 팀장과 팀 배정 이유를 정리합니다",
    },
];

// AI가 배치 완료 콜백을 보내기 시작하면(totalBatches > 0) 실제 진행률로 단계를 계산하고,
// 그 전까지는(AI가 아직 배치 단위로 안 보내는 동안) job.status 기반 대략적인 단계로 대체한다.
const getActiveStepIndex = (jobStatus, completedBatches, totalBatches) => {
    if (totalBatches > 0) {
        const ratio = completedBatches / totalBatches;
        return Math.min(STEPS.length - 1, Math.floor(ratio * STEPS.length));
    }

    if (jobStatus === "COMPLETING") return 3;
    if (jobStatus === "RUNNING") return 1;

    return 0;
};

const getErrorMessage = (error) => {
    const responseData = error.response?.data;

    if (typeof responseData === "string") {
        return responseData;
    }

    if (typeof responseData?.error === "string") {
        return responseData.error;
    }

    if (typeof responseData?.message === "string") {
        return responseData.message;
    }

    if (error.response?.status === 502) {
        return "AI 서버 또는 백엔드 연결이 불안정해 팀 추천안을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.";
    }

    return "팀 추천안 생성 중 오류가 발생했습니다.";
};

const parsePendingSurveyStudents = (message) => {
    if (typeof message !== "string" || !message.includes("설문 미완료 학생")) {
        return null;
    }

    const studentPattern = /([^,:(]+)\((stu\d{4,})\)/g;
    const students = [];
    let match = studentPattern.exec(message);

    while (match) {
        const [, name, userId] = match;
        const grade = userId[3];
        const classNumber = userId[4];
        const groupKey =
            grade && classNumber
                ? `${grade}학년 ${classNumber}반`
                : "반 정보 없음";

        students.push({
            name: name.trim(),
            userId,
            groupKey,
        });

        match = studentPattern.exec(message);
    }

    if (students.length === 0) {
        return null;
    }

    return students.reduce((groups, student) => {
        const matchedGroup = groups.find(
            (group) => group.groupKey === student.groupKey
        );

        if (matchedGroup) {
            matchedGroup.students.push(student);
            return groups;
        }

        return [
            ...groups,
            {
                groupKey: student.groupKey,
                students: [student],
            },
        ];
    }, []);
};

const AdminTeamCreateLoading = () => {
    const navigate = useNavigate();
    const location = useLocation(); // navigate 안에 state값을 확인할 수 있는 함수
    const storedMatchingJob = getActiveMatchingJobLock();
    const grade = location.state?.grade || storedMatchingJob?.grade; // 만약 state가 넘어왔다면 그레이드를 사용하지만 안 넘어오면 저장된 작업의 학년을 사용
    const regenerationPrompt = location.state?.regenerationPrompt || "";
    const baseVersionId = location.state?.baseVersionId || null;
    const [error, setError] = useState("");
    const [jobStatus, setJobStatus] = useState(
        storedMatchingJob?.status || "QUEUED"
    );
    const [batchProgress, setBatchProgress] = useState({
        completedBatches: 0,
        totalBatches: 0,
        progressPercent: null,
    });
    const pendingSurveyGroups = parsePendingSurveyStudents(error);
    const hasPartialTeams = (job) =>
        Array.isArray(job?.partialTeams) && job.partialTeams.length > 0;
    const isMatchingInProgress = Boolean(grade) && !error;
    const activeStepIndex = getActiveStepIndex(
        jobStatus,
        batchProgress.completedBatches,
        batchProgress.totalBatches
    );

    useEffect(() => {
        if (!isMatchingInProgress) return;

        const preventUnload = (event) => {
            event.preventDefault();
            event.returnValue = "";
        };

        const preventBack = () => {
            window.history.pushState(null, "", window.location.href);
        };

        window.history.pushState(null, "", window.location.href);
        window.addEventListener("beforeunload", preventUnload);
        window.addEventListener("popstate", preventBack);

        return () => {
            window.removeEventListener("beforeunload", preventUnload);
            window.removeEventListener("popstate", preventBack);
        };
    }, [isMatchingInProgress]);

    useEffect(() => {
        if (!grade) {
            navigate("/admin/team-create", { replace: true });
            return;
        } // 하지만 팀 로딩 페이지 이동시 api 호출되는 불상사 막기 위해 학생 선택을 안 했다면 다시 팀 생성 페이지로 이동

        let ignore = false;

        const createTeamRecommendation = async () => {
            try {
                const activeLock = getActiveMatchingJobLock();
                const shouldStartNewJob = Boolean(regenerationPrompt);
                let currentJob;

                if (!shouldStartNewJob && activeLock?.jobId) {
                    if (activeLock.grade && activeLock.grade !== grade) {
                        const activeGradeLabel =
                            gradeLabels[activeLock.grade] || "선택한 학년";

                        setError(
                            `${activeGradeLabel} 팀 생성 작업이 진행 중입니다. 완료 후 다시 시도해주세요.`
                        );
                        return;
                    }

                    currentJob = await requestTeamMatchingJob(activeLock.jobId);
                } else if (!shouldStartNewJob && activeLock) {
                    setError(
                        "팀 생성 작업을 시작하는 중입니다. 잠시 후 다시 확인해주세요."
                    );
                    return;
                } else {
                    if (shouldStartNewJob) {
                        clearMatchingJobLock();
                    }

                    setMatchingJobLock({
                        grade,
                        status: "STARTING",
                    });
                    setJobStatus("STARTING");

                    currentJob = await requestStartTeamMatchingJob(
                        grade,
                        regenerationPrompt,
                        baseVersionId
                    );
                }

                setMatchingJobLock({
                    jobId: currentJob?.jobId,
                    grade,
                    status: currentJob?.status,
                });
                setJobStatus(currentJob?.status);
                setBatchProgress({
                    completedBatches: currentJob?.completedBatches ?? 0,
                    totalBatches: currentJob?.totalBatches ?? 0,
                    progressPercent: currentJob?.progressPercent ?? null,
                });

                // 첫 팀 데이터가 실제로 저장된 경우에만 로딩 화면을 벗어나
                // 팀 에딧 화면으로 넘어간다 — 전체 완료를 기다리게 하지 않기 위함(8/2 결정).
                // 나머지 팀은 팀 에딧 화면이 이어서 폴링해 순차적으로 채워 넣는다.
                if (hasPartialTeams(currentJob) && currentJob?.versionId) {
                    clearMatchingJobLock();
                    navigate("/admin/team-edit", {
                        replace: true,
                        state: {
                            grade,
                            jobId: currentJob.jobId,
                            versionId: currentJob.versionId,
                            baseVersionId,
                        },
                    });
                    return;
                }

                while (
                    !ignore &&
                    WAITING_JOB_STATUSES.includes(currentJob?.status)
                ) {
                    await wait(MATCHING_POLL_INTERVAL);
                    if (ignore) return;

                    currentJob = await requestTeamMatchingJob(currentJob.jobId);
                    setMatchingJobLock({
                        jobId: currentJob?.jobId,
                        grade,
                        status: currentJob?.status,
                    });
                    setJobStatus(currentJob?.status);
                setBatchProgress({
                    completedBatches: currentJob?.completedBatches ?? 0,
                    totalBatches: currentJob?.totalBatches ?? 0,
                    progressPercent: currentJob?.progressPercent ?? null,
                });

                    if (hasPartialTeams(currentJob) && currentJob?.versionId) {
                        clearMatchingJobLock();
                        navigate("/admin/team-edit", {
                            replace: true,
                            state: {
                                grade,
                                jobId: currentJob.jobId,
                                versionId: currentJob.versionId,
                                baseVersionId,
                            },
                        });
                        return;
                    }
                }

                if (ignore) return;

                if (currentJob?.status === "SUCCEEDED") {
                    clearMatchingJobLock();
                    navigate("/admin/team-edit", {
                        replace: true,
                        state: {
                            grade,
                            jobId: currentJob.jobId,
                            versionId: currentJob.versionId,
                            baseVersionId,
                        },
                    });
                    return;
                }

                clearMatchingJobLock();
                setError(
                    currentJob?.errorMessage ||
                        "팀 추천안 생성 중 오류가 발생했습니다."
                );
            } catch (e) {
                if (ignore) return;

                console.error("팀 추천안 생성 실패:", e);
                clearMatchingJobLock();
                setError(getErrorMessage(e));
            }
        };

        createTeamRecommendation();

        return () => {
            ignore = true;
        };
    }, [grade, navigate, regenerationPrompt, baseVersionId]);

    return (
        <div className={styles.page}>
            <main className={styles.panel}>
                {pendingSurveyGroups ? (
                    <section className={styles.errorCard}>
                        <span className={styles.errorLabel}>설문 미완료</span>
                        <h1>팀을 생성할 수 없습니다</h1>
                        <p>
                            아래 학생들의 설문 제출이 완료되면 다시 팀을 생성할
                            수 있습니다.
                        </p>

                        <div className={styles.pendingGroupList}>
                            {pendingSurveyGroups.map((group) => (
                                <article
                                    key={group.groupKey}
                                    className={styles.pendingGroup}
                                >
                                    <div
                                        className={styles.pendingGroupHeader}
                                    >
                                        <strong>{group.groupKey}</strong>
                                        <span>{group.students.length}명</span>
                                    </div>

                                    <ul>
                                        {group.students.map((student) => (
                                            <li key={student.userId}>
                                                {student.name}
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>

                        <button
                            type="button"
                            className={styles.retryButton}
                            onClick={() => navigate("/admin/team-create")}
                        >
                            다시 선택하기
                        </button>
                    </section>
                ) : error ? (
                    <div className={styles.loadingState}>
                        <h1 className={styles.loadingTitle}>{error}</h1>
                        <button
                            type="button"
                            className={styles.retryButton}
                            onClick={() => navigate("/admin/team-create")}
                        >
                            다시 선택하기
                        </button>
                    </div>
                ) : (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner} aria-hidden="true" />
                        <h1 className={styles.loadingTitle}>
                            팀이 생성되는 중입니다
                            <span className={styles.dots} aria-hidden="true" />
                        </h1>
                        <p className={styles.loadingSub}>
                            {gradeLabels[grade]} 설문 데이터를 분석하고
                            있습니다
                        </p>

                        {batchProgress.progressPercent !== null && (
                            <p className={styles.loadingSub}>
                                {batchProgress.completedBatches}/
                                {batchProgress.totalBatches}팀 완료 (
                                {batchProgress.progressPercent}%)
                            </p>
                        )}

                        <div className={styles.stepTracker}>
                            {STEPS.map((step, index) => (
                                <div
                                    key={step.title}
                                    className={`${styles.stepRow} ${
                                        index < activeStepIndex
                                            ? styles.done
                                            : index === activeStepIndex
                                            ? styles.active
                                            : ""
                                    }`}
                                >
                                    <div className={styles.stepDot}>
                                        {index < activeStepIndex
                                            ? "✓"
                                            : index + 1}
                                    </div>
                                    <div className={styles.stepBody}>
                                        <div className={styles.stepTitle}>
                                            {step.title}
                                        </div>
                                        <div className={styles.stepDesc}>
                                            {step.desc}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className={styles.cancelNote}>
                            창을 닫거나 뒤로 가면 생성 작업이 중단될 수
                            있습니다.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminTeamCreateLoading;
