import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { requestCreateTeamRecommendation } from "../../../api/teamApi";
import styles from "./AdminTeamCreateLoading.module.css";

const parsePendingSurveyStudents = (message) => {
    if (!message?.includes("설문 미완료 학생")) {
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
    const grade = location.state?.grade; // 만약 state가 넘어왔다면 그레이드를 사용하지만 안 넘어오면 언디파인드
    const regenerationPrompt = location.state?.regenerationPrompt || "";
    const [error, setError] = useState("");
    const pendingSurveyGroups = parsePendingSurveyStudents(error);

    useEffect(() => {
        if (!grade) {
            navigate("/admin/team-create", { replace: true });
            return;
        } // 하지만 팀 로딩 페이지 이동시 api 호출되는 불상사 막기 위해 학생 선택을 안 했다면 다시 팀 생성 페이지로 이동

        const createTeamRecommendation = async () => {
            try {
                await requestCreateTeamRecommendation(
                    grade,
                    regenerationPrompt
                );
                navigate("/admin/team-edit", {
                    replace: true,
                    state: {
                        grade,
                    },
                });
            } catch (e) {
                setError(
                    e.response?.data?.error ||
                        "팀 추천안 생성 중 오류가 발생했습니다."
                );
            }
        };

        createTeamRecommendation();
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
                                    팀을 생성할 수 있습니다.
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
                            팀이 생성되는 중입니다
                            <span className={styles.dots} aria-hidden="true" />
                        </h1>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminTeamCreateLoading;
