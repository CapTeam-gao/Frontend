import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import TeamCreateIcon from "../../../assets/icons/teamCreate.svg";
import { requestAdminDashboard } from "../../../api/dashboardApi";
import {
    getAdminTeamCreationStatus,
    isGradeTeamCreated,
} from "../../../utils/teamStatus";
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

    useEffect(() => {
        const getTeamStatus = async () => {
            try {
                const dashboard = await requestAdminDashboard();
                setTeamStatus(getAdminTeamCreationStatus(dashboard));
            } catch {
                setError("팀 생성 상태를 불러오지 못했습니다.");
            }
        };

        getTeamStatus();
    }, []);

    const handleGradeChange = (e) => {
        setSelectedGrade(e.target.value);
        setError("");
    };

    const handleCreate = () => {
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
                    <div className={styles.iconBox}>
                        <img src={TeamCreateIcon} alt="" />
                    </div>

                    <h1 className={styles.title}>캡스톤 팀 자동 생성</h1>

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
                                학생 희망 직무와 기술 스택을 기준으로 역할을
                                분배합니다.
                            </li>
                            <li>
                                프론트엔드, 백엔드, 디자인, 기획 인원이 한 팀에
                                고르게 배치되도록 구성합니다.
                            </li>
                            <li>
                                사전 설문 데이터를 기반으로 팀별 역량 차이가
                                과하게 벌어지지 않도록 조정합니다.
                            </li>
                        </ul>
                    </section>

                    <button
                        type="button"
                        className={styles.createButton}
                        onClick={handleCreate}
                    >
                        생성
                    </button>
                </main>
            </section>
        </div>
    );
};

export default AdminTeamCreate;
