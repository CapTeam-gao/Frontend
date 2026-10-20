import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import Header from "../../../components/common/header/Header";
import UserPlanForm, {
    PROJECT_PLAN_FORM_ID,
} from "../../../components/user/project/UserPlanForm";
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
import projectIcon from "../../../assets/images/projectPlanV3.webp";

const contentVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 260, damping: 28 },
    },
};

const UserProject = () => {
    const navigate = useNavigate();
    const [projectPlan, setProjectPlan] = useState(emptyProjectPlan);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const shouldReduceMotion = useReducedMotion();
    const hasSavedPlan = Boolean(projectPlan.projectId);
    // 저장 조건(hasEmptyProjectPlanField)과 같은 기준으로 섹션별 완료를 판단한다
    const sections = [
        {
            id: "project-basic",
            label: "기본 정보",
            done: Boolean(
                projectPlan.teamName.trim() && projectPlan.serviceName.trim()
            ),
        },
        {
            id: "project-intro",
            label: "서비스 소개",
            done: Boolean(projectPlan.serviceSummary.trim()),
        },
        {
            id: "project-features",
            label: "주요 기능",
            done: projectPlan.coreFeatures.every((feature) =>
                feature.value.trim()
            ),
        },
    ];
    const doneCount = sections.filter((section) => section.done).length;
    const isAllDone = doneCount === sections.length;

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

    const removeCoreFeature = (id) => {
        setProjectPlan((prevPlan) => ({
            ...prevPlan,
            coreFeatures: prevPlan.coreFeatures.filter(
                (feature) => feature.id !== id
            ),
        }));
    };

    const scrollToSection = (event, sectionId) => {
        event.preventDefault();

        document.getElementById(sectionId)?.scrollIntoView({
            behavior: shouldReduceMotion ? "auto" : "smooth",
            block: "start",
        });
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
                <div className={styles.inner}>
                    <motion.div
                        className={styles.workspace}
                        initial={shouldReduceMotion ? false : "hidden"}
                        animate="visible"
                        variants={contentVariants}
                    >
                        <div className={styles.formArea}>
                            <section className={styles.pageHead}>
                                <img
                                    className={styles.headIcon}
                                    src={projectIcon}
                                    alt=""
                                />
                                <div>
                                    <p className={styles.eyebrow}>
                                        프로젝트 기획서
                                    </p>
                                    <h1 className={styles.headline}>
                                        우리 팀 프로젝트를 소개해주세요
                                    </h1>
                                    <p className={styles.subline}>
                                        저장한 기획서는 관리자 팀 관리 화면에
                                        그대로 보여요.
                                    </p>
                                </div>
                            </section>

                            <UserPlanForm
                                projectPlan={projectPlan}
                                sections={sections}
                                isLoading={isLoading}
                                onSubmit={handleSubmit}
                                onFieldChange={updateField}
                                onAddFeature={addCoreFeature}
                                onFeatureChange={updateCoreFeature}
                                onRemoveFeature={removeCoreFeature}
                            />
                        </div>

                        <aside className={styles.rail} aria-label="작성 현황">
                            <div className={styles.railInner}>
                                <div className={styles.progressHead}>
                                    <span>작성 진행률</span>
                                    <b>
                                        {doneCount} / {sections.length}
                                    </b>
                                </div>
                                <div
                                    className={styles.progressSteps}
                                    role="progressbar"
                                    aria-label="기획서 작성 진행률"
                                    aria-valuemin="0"
                                    aria-valuemax={sections.length}
                                    aria-valuenow={doneCount}
                                >
                                    {sections.map((section) => (
                                        <i
                                            key={section.id}
                                            className={
                                                section.done
                                                    ? styles.progressStepOn
                                                    : ""
                                            }
                                        />
                                    ))}
                                </div>

                                <nav className={styles.sectionNav}>
                                    {sections.map((section, index) => (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            className={
                                                section.done
                                                    ? styles.sectionNavDone
                                                    : ""
                                            }
                                            onClick={(event) =>
                                                scrollToSection(event, section.id)
                                            }
                                        >
                                            <span aria-hidden="true">
                                                {section.done ? "✓" : index + 1}
                                            </span>
                                            {section.label}
                                            <em>
                                                {section.done
                                                    ? "작성 완료"
                                                    : "작성 전"}
                                            </em>
                                        </a>
                                    ))}
                                </nav>

                                <button
                                    type="submit"
                                    form={PROJECT_PLAN_FORM_ID}
                                    className={styles.submitButton}
                                    disabled={isLoading || isSubmitting}
                                >
                                    {isSubmitting
                                        ? "저장 중..."
                                        : hasSavedPlan
                                          ? "수정 저장"
                                          : "저장"}
                                </button>

                                <p
                                    className={
                                        error ? styles.railError : styles.railHint
                                    }
                                    role={error ? "alert" : undefined}
                                >
                                    {error ||
                                        (isAllDone
                                            ? "저장하면 대시보드로 이동해요."
                                            : "모든 항목을 채워야 저장할 수 있어요.")}
                                </p>
                            </div>
                        </aside>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default UserProject;
