import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import {
    requestSaveUserProjectPlan,
    requestUserProjectPlan,
} from "../../../api/projectApi";
import {
    emptyProjectPlan,
    getMainFeaturesText,
    hasEmptyProjectPlanField,
    normalizeProjectPlan,
} from "../../../utils/projectPlan";
import styles from "./UserProject.module.css";

const UserProject = () => {
    const navigate = useNavigate();
    const [projectPlan, setProjectPlan] = useState(emptyProjectPlan);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hasSavedPlan = Boolean(projectPlan.projectId);

    useEffect(() => {
        const getProjectPlan = async () => {
            try {
                const data = await requestUserProjectPlan();
                setProjectPlan(normalizeProjectPlan(data));
            } catch {
                setError("저장된 기획서를 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        getProjectPlan();
    }, []);

    const updateField = (field, value) => {
        setProjectPlan((prevPlan) => ({
            ...prevPlan,
            [field]: value,
        }));
        setError("");
    };

    const addCoreFeature = () => {
        setProjectPlan((prevPlan) => ({
            ...prevPlan,
            coreFeatures: [
                ...prevPlan.coreFeatures,
                {
                    id: Date.now(),
                    value: "",
                },
            ],
        }));
    };

    const updateCoreFeature = (id, value) => {
        setProjectPlan((prevPlan) => ({
            ...prevPlan,
            coreFeatures: prevPlan.coreFeatures.map((feature) =>
                feature.id === id ? { ...feature, value } : feature
            ),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (hasEmptyProjectPlanField(projectPlan)) {
            setError("모든 항목을 작성해야 저장할 수 있습니다.");
            return;
        }

        try {
            setIsSubmitting(true);
            const savedPlan = await requestSaveUserProjectPlan({
                ...projectPlan,
                coreFeatures: getMainFeaturesText(projectPlan.coreFeatures),
            });
            setProjectPlan(normalizeProjectPlan(savedPlan));
            navigate("/user/dashboard");
        } catch {
            setError("기획서를 저장하지 못했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <Link to="/user/dashboard" className={styles.backLink}>
                    ← 처음으로
                </Link>

                <section className={styles.layout}>
                    <form className={styles.formCard} onSubmit={handleSubmit}>
                        {isLoading && (
                            <p className={styles.loadingText}>
                                기획서를 불러오는 중입니다...
                            </p>
                        )}

                        <div className={styles.formSectionHeader}>
                            <span>STEP 1</span>
                            <h2>기본 정보</h2>
                        </div>

                        <div className={styles.fieldGrid}>
                            <label className={styles.field}>
                                <span>팀명</span>
                                <input
                                    type="text"
                                    value={projectPlan.teamName}
                                    placeholder="예: Gao"
                                    onChange={(e) =>
                                        updateField("teamName", e.target.value)
                                    }
                                />
                            </label>

                            <label className={styles.field}>
                                <span>서비스명</span>
                                <input
                                    type="text"
                                    value={projectPlan.serviceName}
                                    placeholder="예: CapTeam"
                                    onChange={(e) =>
                                        updateField(
                                            "serviceName",
                                            e.target.value
                                        )
                                    }
                                />
                            </label>
                        </div>

                        <div className={styles.formSectionHeader}>
                            <span>STEP 2</span>
                            <h2>서비스 내용</h2>
                        </div>

                        <label className={styles.field}>
                            <span>서비스 소개</span>
                            <textarea
                                value={projectPlan.serviceSummary}
                                placeholder="예: CapTeam은 캡스톤 프로젝트 팀 구성과 운영을 한곳에서 관리할 수 있는 서비스입니다.
학생 설문을 기반으로 팀을 생성하고, 캡스톤 운영 및 관리 기능을 이용할 수 있습니다."
                                onChange={(e) =>
                                    updateField(
                                        "serviceSummary",
                                        e.target.value
                                    )
                                }
                            />
                            <small>
                                서비스의 목적, 해결하려는 문제, 핵심 흐름을
                                간단히 작성해주세요.
                            </small>
                        </label>

                        <div className={styles.field}>
                            <div className={styles.featureHeader}>
                                <span>주요 기능</span>
                                <button
                                    type="button"
                                    className={styles.addFeatureButton}
                                    onClick={addCoreFeature}
                                >
                                    주요 기능 추가
                                </button>
                            </div>

                            <div className={styles.featureList}>
                                {projectPlan.coreFeatures.map((feature) => (
                                    <input
                                        key={feature.id}
                                        value={feature.value}
                                        placeholder="예: 팀 생성 기능 - 학년을 선택하면 분석된 학생 정보를 기반으로 추천 팀이 생성됩니다."
                                        onChange={(e) =>
                                            updateCoreFeature(
                                                feature.id,
                                                e.target.value
                                            )
                                        }
                                    />
                                ))}
                            </div>

                            <small>
                                기능명과 설명을 함께 작성하면 팀 관리 화면에서
                                더 명확하게 확인할 수 있습니다.
                            </small>
                        </div>

                        {error && (
                            <p className={styles.errorMessage}>{error}</p>
                        )}

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isLoading || isSubmitting}
                        >
                            {isSubmitting
                                ? "저장 중..."
                                : hasSavedPlan
                                ? "수정 저장"
                                : "저장"}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default UserProject;
