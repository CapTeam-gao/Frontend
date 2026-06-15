import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import {
    requestSaveUserProjectPlan,
    requestUserProjectPlan,
} from "../../../api/projectApi";
import styles from "./UserProject.module.css";

const guideItems = [
    {
        title: "서비스 소개",
        text: "무엇을 해결하는 서비스인지 2~3문장으로 정리합니다.",
    },
    {
        title: "주요 기능",
        text: "로그인, 공지, 팀 생성처럼 실제 구현할 기능을 목록으로 적습니다.",
    },
    {
        title: "대상 사용자",
        text: "이 서비스를 누가 사용하는지 명확하게 작성합니다.",
    },
];

const summaryItems = [
    {
        title: "저장 후 수정 가능",
        text: "작성한 내용은 다시 들어와도 유지됩니다.",
    },
    {
        title: "팀 관리에서 확인",
        text: "저장된 기획서는 이후 팀 관리 화면에서 확인할 수 있습니다.",
    },
    {
        title: "기획 기준 정리",
        text: "서비스명, 대상 사용자, 주요 기능을 한 번에 정리합니다.",
    },
];

const emptyProjectPlan = {
    projectId: null,
    teamName: "",
    serviceName: "",
    serviceSummary: "",
    coreFeatures: "",
};

const normalizeProjectPlan = (data) => {
    const project = data ?? {};

    return {
        ...emptyProjectPlan,
        projectId: project.projectId ?? null,
        teamName: project.teamName ?? "",
        serviceName: project.serviceName ?? "",
        serviceSummary: project.serviceSummary ?? project.serviceIntro ?? "",
        coreFeatures: project.coreFeatures ?? project.mainFeatures ?? "",
    };
};

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

    const requiredFields = [
        projectPlan.teamName,
        projectPlan.serviceName,
        projectPlan.serviceSummary,
        projectPlan.coreFeatures,
    ];

    const updateField = (field, value) => {
        setProjectPlan((prevPlan) => ({
            ...prevPlan,
            [field]: value,
        }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const hasEmptyField = requiredFields.some(
            (field) => !field.trim()
        );

        if (hasEmptyField) {
            setError("모든 항목을 작성해야 저장할 수 있습니다.");
            return;
        }

        try {
            setIsSubmitting(true);
            const savedPlan = await requestSaveUserProjectPlan(projectPlan);
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
                    <aside className={styles.guidePanel}>
                        <strong>작성 기준</strong>
                        <p>
                            팀원이 봤을 때 어떤 서비스를 만들고 있는지 바로
                            이해할 수 있게 작성하는 것이 좋습니다.
                        </p>
                        <ul>
                            {guideItems.map((item) => (
                                <li key={item.title}>
                                    <span>{item.title}</span>
                                    <p>{item.text}</p>
                                </li>
                            ))}
                        </ul>
                    </aside>

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
                                placeholder="예: 캡스톤 프로젝트 팀 구성과 운영을 한곳에서 관리할 수 있는 서비스입니다."
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

                        <label className={styles.field}>
                            <span>주요 기능</span>
                            <textarea
                                value={projectPlan.coreFeatures}
                                placeholder="예: 학생 설문, 팀 자동 생성, 팀 수정, 공지 작성, 캡스톤 일지 관리"
                                onChange={(e) =>
                                    updateField("coreFeatures", e.target.value)
                                }
                            />
                            <small>
                                실제로 구현할 기능을 쉼표나 줄바꿈으로 구분해서
                                작성해주세요.
                            </small>
                        </label>

                        {error && <p className={styles.errorMessage}>{error}</p>}

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
