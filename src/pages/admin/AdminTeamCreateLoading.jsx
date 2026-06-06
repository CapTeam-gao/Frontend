import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { requestCreateTeamRecommendation } from "../../api/teamApi";
import styles from "./AdminTeamCreateLoading.module.css";

const AdminTeamCreateLoading = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const grade = location.state?.grade || "GRADE_2";
    const [error, setError] = useState("");

    useEffect(() => {
        const createTeamRecommendation = async () => {
            try {
                await requestCreateTeamRecommendation(grade);
                navigate("/admin/team-edit", {
                    replace: true,
                    state: {
                        grade,
                    },
                });
            } catch (e) {
                setError(
                    e.response?.data?.message ||
                        e.response?.data?.error ||
                        "팀 추천안 생성 중 오류가 발생했습니다."
                );
            }
        };

        createTeamRecommendation();
    }, [grade, navigate]);

    return (
        <div className={styles.page}>
            <main className={styles.panel}>
                <div className={styles.loadingContent}>
                    <div className={styles.loadingIcon} aria-hidden="true" />
                    {error ? (
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
