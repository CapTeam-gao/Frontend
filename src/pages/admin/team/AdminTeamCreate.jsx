import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import TeamCreateIcon from "../../../assets/icons/teamCreate.svg";
import { requestAdminDashboard } from "../../../api/dashboardApi";
import {
    getAdminTeamCreationStatus,
    isGradeTeamCreated,
} from "../../../utils/teamStatus";
import {
    getActiveMatchingJobLock,
    gradeLabels,
} from "../../../utils/matchingJobLock";
import styles from "./AdminTeamCreate.module.css";

const AdminTeamCreate = () => {
    const navigate = useNavigate();
    const [selectedGrade, setSelectedGrade] = useState("GRADE_2");
    const [teamStatus, setTeamStatus] = useState({
        grade2TeamCreated: false,
        grade3TeamCreated: false,
        allTeamCreated: false,
    });
    const [error, setError] = useState("");

    const selectedGradeLabel = gradeLabels[selectedGrade];

    useEffect(() => {
        const getTeamStatus = async () => {
            try {
                const dashboard = await requestAdminDashboard();
                setTeamStatus(getAdminTeamCreationStatus(dashboard));
            } catch {
                setError("해커톤 팀 생성 상태를 불러오지 못했습니다.");
            }
        };

        getTeamStatus();
    }, []);

    const handleGradeChange = (e) => {
        setSelectedGrade(e.target.value);
        setError("");
    };

    const handleCreate = () => {
        const activeLock = getActiveMatchingJobLock();

        if (activeLock) {
            const activeGradeLabel =
                gradeLabels[activeLock.grade] || "선택한 학년";

            setError(
                `${activeGradeLabel} 해커톤 팀 생성 작업이 진행 중입니다. 완료 후 다시 시도해주세요.`
            );
            return;
        }

        if (isGradeTeamCreated(teamStatus, selectedGrade)) {
            setError("이미 생성이 완료된 학년입니다.");
            return;
        }

        navigate("/admin/team-create/loading", {
            state: {
                grade: selectedGrade, // 페이지를 로딩페이지로 넘어갈 때 스테이트 값으로 그레이드까지 같이 넘기는 로직
            },
        });
    };

    return (
        <div className={styles.page}>
            <Header />

            <section className={styles.panel}>
                <main className={styles.content}>
                    <section className={styles.heroArea}>
                        <div className={styles.iconBox}>
                            <img src={TeamCreateIcon} alt="" />
                        </div>

                        <div className={styles.titleGroup}>
                            <h1 className={styles.title}>
                                해커톤 팀 자동 생성
                            </h1>
                            <p className={styles.description}>
                                해커톤 설문 데이터를 기반으로 학년별 팀 추천안을
                                생성합니다.
                            </p>
                        </div>
                    </section>

                    <div className={styles.gradeTabs} aria-label="학년 선택">
                        <label className={styles.gradeOption}>
                            <input
                                type="radio"
                                name="grade"
                                value="GRADE_2"
                                checked={selectedGrade === "GRADE_2"}
                                onChange={handleGradeChange}
                            />
                            <span>2학년</span>
                        </label>

                        <label className={styles.gradeOption}>
                            <input
                                type="radio"
                                name="grade"
                                value="GRADE_3"
                                checked={selectedGrade === "GRADE_3"}
                                onChange={handleGradeChange}
                            />
                            <span>3학년</span>
                        </label>
                    </div>

                    {error && <p className={styles.errorText}>{error}</p>}

                    <section className={styles.criteriaBox}>
                        <h2 className={styles.criteriaTitle}>생성 기준</h2>
                        <ul className={styles.criteriaList}>
                            <li>
                                희망 직군과 기술 스택을 기준으로 프론트엔드,
                                백엔드, AI, 앱 등 역할이 한 팀에 몰리지 않도록
                                구성합니다.
                            </li>
                            <li>
                                구현 경험과 개발 실행력, 문제 해결력 점수를 함께
                                참고해 해커톤 당일 바로 작업할 수 있는 팀을
                                구성합니다.
                            </li>
                            <li>
                                발표/설명, 리더십/정리, 시간 압박 대응, 체력/집중
                                유지 점수를 함께 반영해 무박2일 협업 흐름을
                                고려합니다.
                            </li>
                        </ul>
                    </section>

                    <button
                        type="button"
                        className={styles.createButton}
                        onClick={handleCreate}
                    >
                        {selectedGradeLabel} 해커톤 팀 생성하기
                    </button>
                </main>
            </section>
        </div>
    );
};

export default AdminTeamCreate;
