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
} from "../../../utils/matchingJobLock";
import styles from "./AdminTeamCreateLoading.module.css";

const MATCHING_POLL_INTERVAL = 5000;
const WAITING_JOB_STATUSES = ["QUEUED", "RUNNING", "COMPLETING"];

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
        return "AI 서버 또는 백엔드 연결이 불안정해 해커톤 팀 추천안을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.";
    }

    return "해커톤 팀 추천안 생성 중 오류가 발생했습니다.";
};

const wait = (ms) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

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
    const [error, setError] = useState("");
    const pendingSurveyGroups = parsePendingSurveyStudents(error);
    const isMatchingInProgress = Boolean(grade) && !error;

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
                            `${activeGradeLabel} 해커톤 팀 생성 작업이 진행 중입니다. 완료 후 다시 시도해주세요.`
                        );
                        return;
                    }

                    currentJob = await requestTeamMatchingJob(activeLock.jobId);
                } else if (!shouldStartNewJob && activeLock) {
                    setError(
                        "해커톤 팀 생성 작업을 시작하는 중입니다. 잠시 후 다시 확인해주세요."
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

                    currentJob = await requestStartTeamMatchingJob(
                        grade,
                        regenerationPrompt
                    );
                }

                setMatchingJobLock({
                    jobId: currentJob?.jobId,
                    grade,
                    status: currentJob?.status,
                });

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
                }

                if (ignore) return;

                if (currentJob?.status === "SUCCEEDED") {
                    clearMatchingJobLock();
                    navigate("/admin/team-edit", {
                        replace: true,
                        state: {
                            grade,
                        },
                    });
                    return;
                }

                clearMatchingJobLock();
                setError(
                    currentJob?.errorMessage ||
                        "해커톤 팀 추천안 생성 중 오류가 발생했습니다."
                );
            } catch (e) {
                if (ignore) return;

                console.error("해커톤 팀 추천안 생성 실패:", e);
                clearMatchingJobLock();
                setError(getErrorMessage(e));
            }
        };

        createTeamRecommendation();

        return () => {
            ignore = true;
        };
    }, [grade, navigate, regenerationPrompt]);

    return (
        <div className={styles.page}>
            <main className={styles.panel}>
                <div className={styles.loadingContent}>
                    <div className={styles.loadingIcon} aria-hidden="true" />
                    {pendingSurveyGroups ? (
                        <>
                            <section className={styles.errorCard}>
                                <span className={styles.errorLabel}>
                                    설문 미완료
                                </span>
                                <h1>팀을 생성할 수 없습니다</h1>
                                <p>
                                    아래 학생들의 설문 제출이 완료되면 다시
                                    해커톤 팀을 생성할 수 있습니다.
                                </p>

                                <div className={styles.pendingGroupList}>
                                    {pendingSurveyGroups.map((group) => (
                                        <article
                                            key={group.groupKey}
                                            className={styles.pendingGroup}
                                        >
                                            <div
                                                className={
                                                    styles.pendingGroupHeader
                                                }
                                            >
                                                <strong>
                                                    {group.groupKey}
                                                </strong>
                                                <span>
                                                    {group.students.length}명
                                                </span>
                                            </div>

                                            <ul>
                                                {group.students.map(
                                                    (student) => (
                                                        <li
                                                            key={
                                                                student.userId
                                                            }
                                                        >
                                                            {student.name}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </article>
                                    ))}
                                </div>
                            </section>

                            <button
                                type="button"
                                className={styles.retryButton}
                                onClick={() => navigate("/admin/team-create")}
                            >
                                다시 선택하기
                            </button>
                        </>
                    ) : error ? (
                        <>
                            <h1 className={styles.loadingText}>{error}</h1>
                            <button
                                type="button"
                                className={styles.retryButton}
                                onClick={() => navigate("/admin/team-create")}
                            >
                                다시 선택하기
                            </button>
                        </>
                    ) : (
                        <h1 className={styles.loadingText}>
                            해커톤 팀이 생성되는 중입니다
                            <span className={styles.dots} aria-hidden="true" />
                        </h1>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminTeamCreateLoading;
